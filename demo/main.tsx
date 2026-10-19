import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Check, Code2, Crop, Download, ImagePlus, Layers, MoveUpRight, X } from 'lucide-react';
import { getOutputDimensions, ImageCropperDialog } from '../src';
import type { CropResult, OutputOptions } from '../src';
import './style.css';

const presets = [
  { name: 'Profile photo', label: '1:1', width: 512, height: 512, note: 'A little more you.', class: 'square' },
  { name: 'Cover image', label: '16:9', width: 1920, height: 1080, note: 'Set the scene.', class: 'landscape' },
  { name: 'Portrait', label: '4:5', width: 1080, height: 1350, note: 'Room for the whole story.', class: 'portrait' },
  { name: 'Story', label: '9:16', width: 1080, height: 1920, note: 'Made for the small screen.', class: 'story' }
];

function App() {
  const [preset, setPreset] = useState(1);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [pixelRatio, setPixelRatio] = useState(1);
  const [format, setFormat] = useState<OutputOptions['type']>('image/jpeg');
  const [maxKB, setMaxKB] = useState('');
  const [viewportW, setViewportW] = useState(800);
  const [viewportH, setViewportH] = useState(850);
  const [dark, setDark] = useState(false);
  const [src, setSrc] = useState<File | string>('/sample.jpg');
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<CropResult | null>(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  let outputPixels;
  try { outputPixels = getOutputDimensions({ width, height, pixelRatio }); } catch { /* The dialog displays validation errors. */ }
  useEffect(() => { if (!result) return; const url = URL.createObjectURL(result.blob); setPreview(url); return () => URL.revokeObjectURL(url); }, [result]);
  const choose = (index: number) => { setPreset(index); setWidth(presets[index].width); setHeight(presets[index].height); };
  const file = (value?: File) => { if (value) { setSrc(value); setResult(null); setMessage(''); setOpen(true); } };
  const code = `import { ImageCropperDialog } from '@organization/image-cropper';\nimport '@organization/image-cropper/styles.css';\n\n<ImageCropperDialog\n  open={open}\n  onOpenChange={setOpen}\n  src={file}\n  output={{ width: ${width}, height: ${height}, pixelRatio: ${pixelRatio}, type: '${format}' }}\n  viewport={{ width: ${viewportW}, height: ${viewportH} }}\n  onCrop={({ file }) => upload(file)}\n/>`;
  return <div className="app">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><Crop size={19} /></span>frame<span className="brand-dot">.</span></a><span className="top-caption">A better fit, every time.</span><a className="doc-link" href="#integration">Integration guide <ArrowUpRight size={14} /></a></header>
    <main>
      <div className="intro"><div><span className="eyebrow"><span />THE IMAGE CROPPER PACKAGE</span><h1>Good images.<br/><span>Perfect proportions.</span></h1><p>One thoughtful cropper for every corner of your product.<br/>Choose a format, find your frame, and make it fit.</p></div><div className="version"><span>REACT + NEXT.JS</span><strong>Small package.<br/>Bigger picture.</strong><span>v0.2.0 <span className="version-dot">●</span> Ready to integrate</span></div></div>
      <section className="workspace" aria-label="Cropper playground">
        <div className="work-header"><span><span className="small-icon"><Layers size={15}/></span>Playground</span><span className="local-badge"><span />All processing stays on your device</span></div>
        <div className="work-body"><aside className="settings">
          <div className="step-title"><span>01</span><h2>Choose your canvas</h2></div><p className="subcopy">Start with a preset or make it your own.</p>
          <div className="presets">{presets.map((p, i) => <button key={p.name} className={`preset ${preset === i ? 'selected' : ''}`} onClick={() => choose(i)} aria-pressed={preset === i}><span className={`ratio-shape ${p.class}`} /><span><strong>{p.name}</strong><small>{p.label}</small></span>{preset === i ? <Check size={14}/> : null}</button>)}</div>
          <div className="dimensions"><label>Width <div><input aria-label="Output width" type="number" min="1" max="8192" value={width} onChange={e => { setWidth(Number(e.target.value)); setPreset(-1); }}/><span>px</span></div></label><X size={12}/><label>Height <div><input aria-label="Output height" type="number" min="1" max="8192" value={height} onChange={e => { setHeight(Number(e.target.value)); setPreset(-1); }}/><span>px</span></div></label></div>
          <label className="field-label">Export format<select aria-label="Export format" value={format} onChange={e => setFormat(e.target.value as OutputOptions['type'])}><option value="image/jpeg">JPG · smaller files</option><option value="image/png">PNG · lossless</option><option value="image/webp">WebP · modern & compact</option></select></label>
          <label className="field-label">Resolution scale<div className="suffix-input"><input aria-label="Resolution scale" type="number" min="0.01" step="0.25" value={pixelRatio} onChange={e => setPixelRatio(Number(e.target.value))}/><span>×</span></div></label>
          <label className="field-label">Maximum file size <span className="optional">optional</span><div className="suffix-input"><input aria-label="Maximum file size in KB" type="number" min="1" value={maxKB} placeholder="No limit" onChange={e => setMaxKB(e.target.value)}/><span>KB</span></div></label>
          <details><summary>Editor preferences</summary><div className="preferences"><label>Dialog width<input aria-label="Dialog width" type="number" min="320" value={viewportW} onChange={e => setViewportW(Number(e.target.value))}/></label><label>Dialog height<input aria-label="Dialog height" type="number" min="320" value={viewportH} onChange={e => setViewportH(Number(e.target.value))}/></label><label className="checkbox"><input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)}/>Dark editor</label></div></details>
          <div className="settings-note"><Code2 size={15}/><p>Your dimensions. Your design system.<br/><strong>One reusable component.</strong></p></div>
        </aside>
        <div className="preview-panel"><div className="preview-heading"><div className="step-title"><span>02</span><h2>Find your frame</h2></div><button className="text-button" onClick={() => input.current?.click()}><ImagePlus size={14}/>Use your image</button></div>
          <div className="image-card" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); file(e.dataTransfer.files[0]); }}><img src={preview || '/sample.jpg'} alt={preview ? 'Your exported crop' : 'Sunlit mountain peaks above an alpine valley'} style={preview ? { objectFit: 'contain' } : undefined}/><span className="image-badge">{preview ? 'YOUR EXPORTED IMAGE' : 'A FRESH PERSPECTIVE'}</span><button className="expand-button" aria-label="Open image cropper" onClick={() => setOpen(true)}><MoveUpRight size={18}/></button><div className="image-caption"><span>{preview ? 'A perfect fit.' : 'A little perspective goes a long way.'}</span><small>{preview ? `${result?.width} × ${result?.height} pixels` : 'Dolomites, Italy'}</small></div></div>
          <div className="preview-bottom"><div><strong>{result ? 'Your image is ready' : presets[preset]?.name ?? 'Custom dimensions'}</strong><span>{result?.width ?? outputPixels?.width ?? '—'} × {result?.height ?? outputPixels?.height ?? '—'} px <span>·</span> {format?.split('/')[1].toUpperCase()}{result ? ` · ${(result.size / 1024).toFixed(1)} KB` : ''}</span></div><button className="primary-button" onClick={() => setOpen(true)}><Crop size={16}/>{result ? 'Crop again' : 'Open cropper'}<ArrowUpRight size={15}/></button></div>
          {result && preview ? <a className="download-link" href={preview} download={result.file.name}><Download size={14}/>Download cropped image</a> : <p className="preview-note">Try the sample, or drop an image here to get started.</p>}
          {message ? <p role="status" className="demo-message">{message}</p> : null}
          <input ref={input} type="file" accept="image/*" hidden onChange={e => { file(e.target.files?.[0]); e.target.value = ''; }}/>
        </div></div>
      </section>
      <section id="integration" className="integration"><div><span className="eyebrow">BUILT TO BELONG</span><h2>Fits right into<br/>your next project.</h2><p>A controlled dialog, a few props, and an image<br/>that’s ready for wherever it goes next.</p><div className="framework-tags"><span>React 18 / 19</span><span>Next.js App Router</span><span>TypeScript</span></div></div><div className="code-card"><div><span><Code2 size={14}/>YourComponent.tsx</span><button onClick={() => { void navigator.clipboard.writeText(code).then(() => setMessage('Integration snippet copied.')).catch(() => setMessage('Clipboard unavailable. Select and copy the snippet below.')); }}>Copy snippet</button></div><pre><code>{code}</code></pre></div></section>
      <footer><span className="brand">frame.</span><span>Thoughtfully framed. Effortlessly integrated.</span><span>Built with Arc UI ↗</span></footer>
    </main>
    <ImageCropperDialog open={open} onOpenChange={setOpen} src={src} output={{ width, height, pixelRatio, type: format, maxBytes: maxKB ? Number(maxKB) * 1024 : undefined }} viewport={{ width: viewportW, height: viewportH }} theme={dark ? 'dark' : 'light'} onCrop={setResult}/>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
