"use client";

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Cropper from 'react-easy-crop';
import { Crop, Minus, Plus, RotateCcw, RotateCw, Check, LoaderCircle } from 'lucide-react';
import { Dialog, DialogContent } from './arc/dialog/dialog';
import { exportCrop, loadImage, validateOptions } from './crop';
import type { CropArea, ImageCropperDialogProps } from './types';
import 'react-easy-crop/react-easy-crop.css';
import './styles.css';

const asError = (error: unknown) => error instanceof Error ? error : new Error('Something went wrong. Please try again.');

export function ImageCropperDialog(props: ImageCropperDialogProps) {
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => { if (props.open) trigger.current = document.activeElement as HTMLElement; }, [props.open]);
  const viewport = props.viewport;
  const style = {
    '--ic-width': viewport && Number.isFinite(viewport.width) && viewport.width > 0 ? `${viewport.width}px` : '920px',
    '--ic-height': viewport && Number.isFinite(viewport.height) && viewport.height > 0 ? `${viewport.height}px` : '780px'
  } as CSSProperties;
  return <Dialog open={props.open} onOpenChange={props.onOpenChange}>
    <DialogContent
      title={props.title ?? 'Make it picture perfect'}
      description={props.description ?? 'Find your frame. We’ll take care of the dimensions.'}
      className={`ic-theme ic-dialog ${props.className ?? ''}`}
      data-ic-theme={props.theme ?? 'light'} style={style}
      onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}
    >
      {props.open ? <SourceEditor {...props} /> : null}
    </DialogContent>
  </Dialog>;
}

function SourceEditor(props: ImageCropperDialogProps) {
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const errorCallback = useRef(props.onError);
  errorCallback.current = props.onError;
  let configError = '';
  let aspect = 1;
  try {
    aspect = validateOptions(props.output, props.aspectRatio);
    if (props.maxZoom !== undefined && (!Number.isFinite(props.maxZoom) || props.maxZoom < 1)) throw new Error('maxZoom must be at least 1.');
    if (props.maxInputBytes !== undefined && (!Number.isSafeInteger(props.maxInputBytes) || props.maxInputBytes < 1)) throw new Error('Input size limit must be a positive integer.');
  } catch (cause) { configError = asError(cause).message; }

  useEffect(() => {
    let active = true;
    let url = '';
    setSource(''); setError('');
    const fail = (cause: unknown) => {
      if (!active) return;
      const e = asError(cause); setError(e.message); errorCallback.current?.(e);
    };
    if (configError) fail(new Error(configError));
    else {
      try {
        if (typeof props.src !== 'string') {
          if (props.maxInputBytes && props.src.size > props.maxInputBytes) throw new Error('This file exceeds the input size limit. Choose a smaller image.');
          if (props.src.type && !/^image\//.test(props.src.type)) throw new Error('Choose an image file.');
          url = URL.createObjectURL(props.src);
        } else {
          if (props.maxInputBytes) throw new Error('maxInputBytes requires a File or Blob source. Fetch remote images as a Blob first.');
          url = props.src;
        }
        void loadImage(url).then(() => { if (active) setSource(url); }).catch(fail);
      } catch (cause) { fail(cause); }
    }
    return () => { active = false; if (url.startsWith('blob:') && typeof props.src !== 'string') URL.revokeObjectURL(url); };
  }, [props.src, props.maxInputBytes, configError]);

  if (error || configError) return <div className="ic-empty"><Crop size={32} aria-hidden="true" /><p role="alert">{error || configError}</p><button className="ic-button" onClick={() => props.onOpenChange(false)}>Close editor</button></div>;
  if (!source) return <div className="ic-empty" role="status"><LoaderCircle className="ic-spinner" aria-hidden="true" />Loading your image…</div>;
  return <Editor key={`${source}:${aspect}:${props.output.width}:${props.output.height}`} {...props} source={source} aspect={aspect} />;
}

function Editor(props: ImageCropperDialogProps & { source: string; aspect: number }) {
  const id = useId();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<CropArea | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const alive = useRef(true);
  const saving = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const completed = useCallback((_: CropArea, pixels: CropArea) => setArea(pixels), []);
  const maxZoom = props.maxZoom ?? 3;
  const reset = () => { setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); setError(''); };
  const save = async () => {
    if (!area || saving.current) return;
    saving.current = true; setBusy(true); setError('');
    try {
      const result = await exportCrop(props.source, area, rotation, props.output, props.fileName);
      if (!alive.current) return;
      await props.onCrop(result);
      if (alive.current) props.onOpenChange(false);
    } catch (cause) {
      if (alive.current) { const e = asError(cause); setError(e.message); props.onError?.(e); }
    } finally { saving.current = false; if (alive.current) setBusy(false); }
  };
  const rotate = () => { setArea(null); setRotation(value => (value + 90) % 360); setCrop({ x: 0, y: 0 }); setZoom(1); };
  return <div className="ic-editor" aria-busy={busy}>
    <div className="ic-info"><span><span className="ic-status-dot" />Ready to crop</span><span>{natural.width} × {natural.height} px source</span></div>
    <div className="ic-stage" aria-label="Image crop area" aria-describedby={`${id}-instructions`}>
      <Cropper image={props.source} crop={crop} zoom={zoom} rotation={rotation} aspect={props.aspect}
        minZoom={1} maxZoom={maxZoom} onCropChange={setCrop} onZoomChange={setZoom}
        onCropComplete={completed} onMediaLoaded={media => setNatural({ width: media.naturalWidth, height: media.naturalHeight })}
        showGrid restrictPosition keyboardStep={10} zoomWithScroll={false} disableAutomaticStylesInjection
        cropperProps={{ 'aria-label': 'Position image: use arrow keys to move; use the zoom slider to resize', tabIndex: busy ? -1 : 0 }}
        style={{ containerStyle: busy ? { pointerEvents: 'none' } : undefined }}
      />
      <span className="ic-frame-label" aria-hidden="true">{props.output.width} × {props.output.height}</span>
    </div>
    <p id={`${id}-instructions`} className="ic-instructions">Drag to reposition · Pinch to zoom · Arrow keys for precision</p>
    <fieldset className="ic-controls" disabled={busy}>
      <div className="ic-zoom-label"><label htmlFor={`${id}-zoom`}>Zoom</label><output htmlFor={`${id}-zoom`}>{Math.round(zoom * 100)}%</output></div>
      <div className="ic-tools"><button className="ic-icon" aria-label="Zoom out" onClick={() => setZoom(z => Math.max(1, z - .1))} disabled={zoom <= 1 || busy}><Minus size={17} /></button>
        <input id={`${id}-zoom`} aria-label="Zoom" type="range" min="1" max={maxZoom} step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} />
        <button className="ic-icon" aria-label="Zoom in" onClick={() => setZoom(z => Math.min(maxZoom, z + .1))} disabled={zoom >= maxZoom || busy}><Plus size={17} /></button>
        <span className="ic-tool-divider" />
        {props.allowRotation !== false ? <button className="ic-icon" aria-label="Rotate clockwise 90 degrees" title="Rotate 90°" onClick={rotate}><RotateCw size={18} /></button> : null}
        <button className="ic-icon" aria-label="Reset crop" title="Reset crop" onClick={reset}><RotateCcw size={18} /></button>
      </div>
    </fieldset>
    <div className="ic-export"><div className="ic-export-icon"><Crop size={19} aria-hidden="true" /></div><div><strong>Made to measure</strong><span>{props.output.width} × {props.output.height} px · {(props.output.type ?? 'image/jpeg').split('/')[1].toUpperCase()}{props.output.maxBytes ? ` · Up to ${Math.round(props.output.maxBytes / 1024)} KB` : ''}</span></div><span className="ic-ratio">{Number(props.aspect.toFixed(2))}:1</span></div>
    {area && (area.width < props.output.width || area.height < props.output.height) ? <p className="ic-warning">This crop is smaller than the output. Enlarging it may reduce sharpness.</p> : null}
    {error ? <p className="ic-error" role="alert">{error}</p> : null}
    <div className="ic-footer"><span>Processed on your device</span><div><button className="ic-button" onClick={() => props.onOpenChange(false)}>Cancel</button><button className="ic-button ic-primary" disabled={!area || busy} onClick={() => void save()}>{busy ? <LoaderCircle size={16} className="ic-spinner" /> : <Check size={16} />}{busy ? 'Saving…' : 'Save image'}</button></div></div>
  </div>;
}
