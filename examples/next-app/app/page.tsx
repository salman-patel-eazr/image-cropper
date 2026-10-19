'use client';
import { useState } from 'react';
import { ImageCropperDialog } from '@organization/image-cropper';
export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  return <main><h1>Next.js image cropper</h1><label>Choose image<input type="file" accept="image/*" onChange={event => {
    const selected = event.target.files?.[0]; if (selected) { setFile(selected); setOpen(true); }
    event.target.value = '';
  }}/></label><p role="status">{message}</p>{file ? <ImageCropperDialog src={file} open={open} onOpenChange={setOpen}
    output={{ width: 512, height: 512, type: 'image/png' }}
    onCrop={result => setMessage(`Exported ${result.width} × ${result.height}: ${result.size} bytes`)}
  /> : null}</main>;
}
