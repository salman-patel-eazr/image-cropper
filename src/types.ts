export interface Dimensions { width: number; height: number }
export interface CropArea extends Dimensions { x: number; y: number }
export interface OutputOptions extends Dimensions {
  /** Export scale, independent of screen density. Default 1. Final pixels = round(dimension * pixelRatio). */
  pixelRatio?: number;
  type?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** JPEG/WebP quality, from 0 to 1. Default 0.92. */
  quality?: number;
  /** Best possible quality under this ceiling; throws if impossible at fixed dimensions. */
  maxBytes?: number;
  /** Background for JPEG transparency. Default #ffffff. */
  background?: string;
}
export interface CropResult extends Dimensions {
  blob: Blob;
  file: File;
  type: string;
  size: number;
  crop: CropArea;
  rotation: number;
}
export interface ImageCropperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A File, Blob, data URL, same-origin URL, or CORS-enabled remote URL. */
  src: File | Blob | string;
  output: OutputOptions;
  /** Defaults to output.width / output.height. Must match it to avoid distortion. */
  aspectRatio?: number;
  /** Optional editor size cap in CSS pixels; always also fits the actual viewport. */
  viewport?: Dimensions;
  onCrop: (result: CropResult) => void | Promise<void>;
  onError?: (error: Error) => void;
  title?: string;
  description?: string;
  fileName?: string;
  maxInputBytes?: number;
  maxZoom?: number;
  allowRotation?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}
