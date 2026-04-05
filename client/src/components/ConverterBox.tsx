import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Upload, FileText, Download, RefreshCw, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';


type Stage = 'idle' | 'uploaded' | 'converting' | 'done' | 'error';

interface UploadResponse {
  success: boolean;
  fileId: string;
  filename: string;
  originalName: string;
  size: number;
  detectedFormat: string;
  compatibleFormats: string[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ConverterBox() {
  const [stage, setStage] = useState<Stage>('idle');
  const [dragging, setDragging] = useState(false);
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [outputFormat, setOutputFormat] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setStage('idle');
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post<UploadResponse>(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setUploadData(res.data);
      setOutputFormat(res.data.compatibleFormats[0] ?? '');
      setStage('uploaded');
      setProgress(0);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { error: string })?.error ?? err.message
        : 'Upload failed.';
      setError(msg);
      setStage('error');
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConvert = async () => {
    if (!uploadData || !outputFormat) return;
    setStage('converting');
    setError('');
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 5, 85));
    }, 300);

    try {
      const res = await axios.post<{ downloadUrl: string; convertedFilename: string }>(
        `${API}/convert`,
        { filename: uploadData.filename, outputFormat }
      );
      clearInterval(interval);
      setProgress(100);
      setDownloadUrl(`http://localhost:5000${res.data.downloadUrl}`);
      setStage('done');
    } catch (err) {
      clearInterval(interval);
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { error: string })?.error ?? err.message
        : 'Conversion failed.';
      setError(msg);
      setStage('error');
    }
  };

  const reset = () => {
    setStage('idle');
    setUploadData(null);
    setOutputFormat('');
    setProgress(0);
    setDownloadUrl('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="converter-box" id="converter">
      {/* ── IDLE / DROP ZONE ── */}
      {(stage === 'idle' || stage === 'error') && (
        <>
          <div
            id="drop-zone"
            className={`drop-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload file drop zone"
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <div className="drop-zone-icon">
              <Upload size={22} />
            </div>
            <p className="drop-zone-text">
              {dragging ? 'Drop it here!' : 'Drag & drop your file'}
            </p>
            <p className="drop-zone-sub">
              or <span>click to browse</span> — up to 50 MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            id="file-input"
            style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
          {stage === 'error' && error && (
            <div className="error-msg" role="alert">
              <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
              {error}
            </div>
          )}
        </>
      )}

      {/* ── UPLOADED ── */}
      {stage === 'uploaded' && uploadData && (
        <>
          <div className="file-info-card">
            <div className="file-icon">.{uploadData.detectedFormat.toUpperCase()}</div>
            <div className="file-details">
              <div className="file-name">{uploadData.originalName}</div>
              <div className="file-size">{formatBytes(uploadData.size)} · Detected: {uploadData.detectedFormat.toUpperCase()}</div>
            </div>
          </div>

          {uploadData.compatibleFormats.length > 0 ? (
            <>
              <div className="format-select-row">
                <div className="format-label">Convert to</div>
                <select
                  id="format-select"
                  className="format-select"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                >
                  {uploadData.compatibleFormats.map((fmt) => (
                    <option key={fmt} value={fmt}>.{fmt.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <button
                id="convert-btn"
                className="btn btn-gradient"
                onClick={handleConvert}
                disabled={!outputFormat}
              >
                Convert <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <div className="error-msg" style={{ marginTop: 16 }}>
              No supported conversion targets for this file type yet.
            </div>
          )}

          <button id="reset-btn-uploaded" className="btn btn-ghost" onClick={reset}>
            <RefreshCw size={14} /> Choose different file
          </button>
        </>
      )}

      {/* ── CONVERTING ── */}
      {stage === 'converting' && (
        <>
          <div className="file-info-card">
            <div className="file-icon">
              <FileText size={18} />
            </div>
            <div className="file-details">
              <div className="file-name">{uploadData?.originalName}</div>
              <div className="file-size">Converting to .{outputFormat.toUpperCase()}…</div>
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-label">Converting… {progress}%</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </>
      )}

      {/* ── DONE ── */}
      {stage === 'done' && (
        <>
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle size={24} />
            </div>
            <div className="success-title">Conversion Complete! 🎉</div>
            <div className="success-sub">
              Your file is ready to download
            </div>
          </div>
          <a
            id="download-btn"
            href={downloadUrl}
            download
            className="btn btn-gradient"
            style={{ textDecoration: 'none', display: 'inline-flex', width: '100%', marginTop: 20 }}
          >
            <Download size={16} /> Download .{outputFormat.toUpperCase()} File
          </a>
          <button id="reset-btn-done" className="btn btn-ghost" onClick={reset}>
            <RefreshCw size={14} /> Convert another file
          </button>
        </>
      )}
    </div>
  );
}
