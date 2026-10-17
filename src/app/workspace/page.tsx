"use client";

import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent as ReactMouseEvent } from "react";
import ResearchPanel from "@/components/ResearchPanel";

type Point = { x: number; y: number };
type CvApi = {
  Mat: new () => any;
  imread: (source: HTMLImageElement) => any;
  imshow: (canvas: HTMLCanvasElement, mat: any) => void;
  Size: new (width: number, height: number) => any;
  matFromArray: (rows: number, cols: number, type: number, data: number[]) => any;
  getPerspectiveTransform: (src: any, dst: any) => any;
  warpPerspective: (src: any, dst: any, matrix: any, size: any, interpolation: number, borderMode: number) => void;
  CV_32FC2: number;
  INTER_LINEAR: number;
  BORDER_CONSTANT: number;
  onRuntimeInitialized?: () => void;
};
declare global { interface Window { cv?: CvApi } }

const NAMES = ["Top left", "Top right", "Bottom right", "Bottom left"];
const W = 800;
const H = 600;

export default function HomePage() {
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [corners, setCorners] = useState<Point[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [cvReady, setCvReady] = useState(false);
  const [cvLoading, setCvLoading] = useState(true);
  const [warped, setWarped] = useState(false);
  const [warpedUrl, setWarpedUrl] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Upload a sketch or start the camera to begin.");
  const fileInput = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let alive = true;
    const ready = () => { if (alive) { setCvReady(true); setCvLoading(false); } };
    if (window.cv?.Mat) { ready(); return () => { alive = false; }; }
    let script = document.querySelector<HTMLScriptElement>('script[data-papernet-opencv="1"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://docs.opencv.org/4.x/opencv.js";
      script.async = true;
      script.dataset.papernetOpencv = "1";
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => {
      const cv = window.cv;
      if (!cv) { if (alive) { setCvLoading(false); setError("OpenCV.js loaded without a runtime. Reload and try again."); } return; }
      if (cv.Mat) ready();
      else cv.onRuntimeInitialized = ready;
    }, { once: true });
    script.addEventListener("error", () => {
      if (alive) { setCvLoading(false); setError("OpenCV.js could not load. Check your connection or upload again after reloading."); }
    }, { once: true });
    if (window.cv?.Mat) ready();
    return () => { alive = false; };
  }, []);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((track) => track.stop()); }, []);

  useEffect(() => {
    if (!cameraOn || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => setError("Could not start camera playback. Check browser permissions and try again."));
  }, [cameraOn]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const setSource = (url: string, name: string) => {
    setImageUrl(url);
    setFileName(name);
    setCorners([]);
    setWarped(false);
    setWarpedUrl("");
    setError("");
    setStatus("Click the four paper corners clockwise, starting at the top-left.");
  };

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file such as JPG, PNG, or WEBP."); return; }
    if (file.size > 15 * 1024 * 1024) { setError("Image exceeds 15 MB. Choose a smaller file."); return; }
    stopCamera();
    setSource(URL.createObjectURL(file), file.name);
  };

  const startCamera = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access requires localhost or HTTPS. You can upload an image instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      setStatus("Frame the whole page, then capture the camera image.");
    } catch {
      setError("Camera permission was denied or no camera is available. Use image upload instead.");
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) { setError("Camera is starting. Wait a moment and retry."); return; }
    const frame = document.createElement("canvas");
    frame.width = video.videoWidth;
    frame.height = video.videoHeight;
    frame.getContext("2d")?.drawImage(video, 0, 0);
    setSource(frame.toDataURL("image/jpeg", 0.94), "camera-capture.jpg");
    stopCamera();
  };

  const markCorner = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (corners.length >= 4) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
    const next = [...corners, point];
    setCorners(next);
    setWarped(false);
    setWarpedUrl("");
    setError("");
    setStatus(next.length === 4 ? "Four corners selected. Run perspective correction." : "Corner " + next.length + " selected. Next: " + NAMES[next.length] + ".");
  };

  const correctPerspective = () => {
    const cv = window.cv;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!cvReady || !cv || !image || !canvas) { setError("Wait for the OpenCV runtime to become ready."); return; }
    if (corners.length !== 4) { setError("Mark all four paper corners before correcting perspective."); return; }
    let src: any, dst: any, srcPts: any, dstPts: any, matrix: any;
    try {
      const points = corners.map((p) => ({ x: p.x * image.naturalWidth, y: p.y * image.naturalHeight }));
      src = cv.imread(image);
      srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, points.flatMap((p) => [p.x, p.y]));
      dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, W - 1, 0, W - 1, H - 1, 0, H - 1]);
      matrix = cv.getPerspectiveTransform(srcPts, dstPts);
      dst = new cv.Mat();
      cv.warpPerspective(src, dst, matrix, new cv.Size(W, H), cv.INTER_LINEAR, cv.BORDER_CONSTANT);
      canvas.width = W;
      canvas.height = H;
      cv.imshow(canvas, dst);
      setWarpedUrl(canvas.toDataURL("image/png"));
      setWarped(true);
      setError("");
      setStatus("Perspective correction complete. The normalized 800 × 600 image is ready for Phase 2.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Perspective correction failed. Re-select the four corners.");
    } finally {
      src?.delete(); dst?.delete(); srcPts?.delete(); dstPts?.delete(); matrix?.delete();
    }
  };

  const reset = () => {
    stopCamera();
    setImageUrl("");
    setFileName("");
    setCorners([]);
    setWarped(false);
    setWarpedUrl("");
    setError("");
    setStatus("Upload a sketch or start the camera to begin.");
    if (fileInput.current) fileInput.current.value = "";
  };

  const download = () => {
    if (!warpedUrl || !warped) return;
    const anchor = document.createElement("a");
    anchor.href = warpedUrl;
    anchor.download = "papernet-corrected-800x600.png";
    anchor.click();
  };

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span><span><strong>PaperNet</strong><small>PHYSICAL → DIGITAL</small></span></a>
        <div className="top-meta"><i /> DEVLYMPICS SHUNYA 2026 <span>/</span> PHASE 01</div>
        <div className="top-spacer" />
        <span className={"engine-pill " + (cvReady ? "ready" : "")}><i />{cvReady ? "OPENCV READY" : cvLoading ? "LOADING OPENCV…" : "OPENCV OFFLINE"}</span>
        <button className="button quiet" onClick={reset}>Reset</button>
      </header>

      <section className="intro">
        <div><p className="eyebrow">CIRCUIT CAPTURE WORKSPACE</p><h1>Bring the paper circuit into focus.</h1><p className="subhead">Capture a hand-drawn circuit, mark the paper boundary, and flatten it into a consistent frame for computer vision.</p></div>
        <div className="phase-card"><span>PHASE 01</span><strong>Capture + perspective</strong><small>Target output · 800 × 600 px</small></div>
      </section>

      <nav className="pipeline"><div className="pipeline-step active"><b>01</b><span><strong>Capture</strong><small>Camera or upload</small></span></div><div className="pipeline-line" /><div className={"pipeline-step " + (imageUrl ? "active" : "")}><b>02</b><span><strong>Mark corners</strong><small>Clockwise selection</small></span></div><div className="pipeline-line" /><div className={"pipeline-step " + (warped ? "active" : "")}><b>03</b><span><strong>Flatten</strong><small>OpenCV transform</small></span></div></nav>

      <section className="workspace">
        <aside className="panel controls">
          <div className="panel-title"><b>01</b><div><h2>Input source</h2><p>Use a photo or live camera.</p></div></div>
          <input ref={fileInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/*" onChange={onUpload} />
          <button className="button primary full" onClick={() => fileInput.current?.click()}>↑ Upload circuit image</button>
          <button className="button full" onClick={cameraOn ? stopCamera : startCamera}>{cameraOn ? "Stop camera" : "◎ Start camera"}</button>
          {cameraOn && <button className="button primary full" onClick={captureFrame}>Capture frame</button>}
          <div className="rule" />
          <div className="panel-title"><b>02</b><div><h2>Paper boundary</h2><p>Click four corners in order.</p></div></div>
          <ol className="corner-list">{NAMES.map((name, i) => <li key={name} className={corners[i] ? "done" : ""}><span>{i + 1}</span>{name}<em>{corners[i] ? "✓" : "—"}</em></li>)}</ol>
          <div className="button-row"><button className="button" disabled={!corners.length} onClick={() => { setCorners(corners.slice(0, -1)); setWarped(false); }}>Undo point</button><button className="button" disabled={!corners.length} onClick={() => { setCorners([]); setWarped(false); }}>Clear points</button></div>
          <div className="rule" />
          <button className="button primary full" disabled={!imageUrl || corners.length !== 4 || !cvReady} onClick={correctPerspective}>Correct perspective ↗</button>
          <p className="microcopy">Image processing happens in your browser. No image is uploaded to a server.</p>
        </aside>

        <section className="preview-column">
          <div className="panel preview-panel">
            <div className="preview-head"><div><small>SOURCE FRAME</small><strong>{fileName || (cameraOn ? "Camera preview" : "No image selected")}</strong></div><span>{imageUrl ? "INPUT" : "AWAITING INPUT"}</span></div>
            {cameraOn && !imageUrl ? <div className="camera-stage"><video ref={videoRef} autoPlay muted playsInline /><p>Keep the full paper inside the frame.</p></div> : imageUrl ? <div className="image-stage"><button type="button" className="image-wrap" onClick={markCorner} aria-label="Select four paper corners">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imageRef} src={imageUrl} alt="Circuit sketch for corner selection" />
              <svg className="point-overlay" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
                {corners.length > 1 && <polyline points={corners.map((p) => (p.x * 1000) + "," + (p.y * 1000)).join(" ")} fill="none" stroke="#8fc5ff" strokeWidth="3" vectorEffect="non-scaling-stroke" />}
                {corners.map((p, i) => <g key={i}><circle cx={p.x * 1000} cy={p.y * 1000} r="13" fill="#8fc5ff" stroke="#09111d" strokeWidth="4" vectorEffect="non-scaling-stroke" /><text x={p.x * 1000} y={p.y * 1000 + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="#09111d">{i + 1}</text></g>)}
              </svg>
            </button><p className="image-hint">{corners.length < 4 ? "Select point " + (corners.length + 1) + " of 4 · " + NAMES[corners.length] : "Four corners marked · ready to flatten"}</p></div> : <div className="empty-stage"><div className="paper-icon"><i /><i /><i /></div><strong>Your circuit sketch will appear here</strong><p>Upload a photo or enable the camera to get started.</p><button className="button" onClick={() => fileInput.current?.click()}>Choose image</button></div>}
            <div className="status-bar"><i />{status}</div>
          </div>

          <div className="panel output-panel"><div className="preview-head"><div><small>NORMALIZED OUTPUT</small><strong>Perspective-corrected frame</strong></div><span>{warped ? "800 × 600 PX" : "NOT GENERATED"}</span></div>
            {warped ? <div className="warped-preview"><img src={warpedUrl} alt="Perspective-corrected circuit sketch at 800 by 600 pixels" /><div className="output-actions"><small>PNG · 4:3 canonical frame</small><button className="button primary" onClick={download}>Download PNG ↓</button></div></div> : <div className="output-empty"><b>＋</b><span>Correct perspective to generate a normalized frame.</span><small>Output size is fixed at 800 × 600 pixels.</small></div>}
          </div>
        </section>

        <aside className="panel inspector">
          <div className="panel-title"><b>i</b><div><h2>Capture inspector</h2><p>Session and runtime status.</p></div></div>
          <div className="metric"><small>VISION ENGINE</small><strong className={cvReady ? "good" : ""}>{cvReady ? "Ready" : cvLoading ? "Initializing…" : "Unavailable"}</strong><p>{cvReady ? "OpenCV.js runtime loaded" : "Needs internet on first load"}</p></div>
          <div className="metric"><small>INPUT IMAGE</small><strong>{imageUrl ? "Loaded" : cameraOn ? "Live stream" : "Waiting"}</strong><p>{fileName || "No source attached"}</p></div>
          <div className="metric"><small>CORNER POINTS</small><strong>{corners.length} / 4</strong><p>{corners.length === 4 ? "Boundary complete" : "Mark paper edges, not circuit nodes"}</p></div>
          <div className="metric"><small>OUTPUT FRAME</small><strong>{warped ? "800 × 600" : "—"}</strong><p>Four-point perspective transform</p></div>
          <div className="rule" />
          <div className="tip"><b>✳</b><div><strong>For best results</strong><p>Use a flat, well-lit page. Keep all paper edges in frame and avoid shadows.</p></div></div>
          <div className="tip"><b className="amber">!</b><div><strong>Point order matters</strong><p>Tap top-left, top-right, bottom-right, then bottom-left.</p></div></div>
          <div className="next-phase"><small>NEXT UP</small><strong>Phase 02 · Ink extraction</strong><p>Grayscale, adaptive thresholding, and stroke cleanup will use the corrected frame.</p><em>PLANNED · NOT IMPLEMENTED</em></div>
        </aside>
      </section>
      <div className="workspace-research"><ResearchPanel /></div>
      {error && <div className="toast" role="alert"><b>!</b>{error}<button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
      <footer className="footer"><span>PaperNet · local-first vision pipeline</span><span>Phase 01 of 03 <i /> Capture &amp; perspective correction</span></footer>
      <canvas ref={canvasRef} className="processing-canvas" aria-hidden="true" />
    </main>
  );
}
