'use client';
import { useState } from 'react';
import { ImageCropperDialog } from '@organization/image-cropper';
export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  return <main><h1>Next.js image cropper</h1><p>Custom 13:7 crop: 650 × 350 at 2× exports 1300 × 700 pixels.</p><label>Choose image<input type="file" accept="image/*" onChange={event => {
    const selected = event.target.files?.[0]; if (selected) { setFile(selected); setOpen(true); }
    event.target.value = '';
  }}/></label><p role="status">{message}</p>{file ? <ImageCropperDialog src={file} open={open} onOpenChange={setOpen}
    aspectRatio={13 / 7}
    output={{ width: 650, height: 350, pixelRatio: 2, type: 'image/png' }}
    onCrop={result => setMessage(`Exported ${result.width} × ${result.height}: ${result.size} bytes`)}
  /> : null}</main>;
}
