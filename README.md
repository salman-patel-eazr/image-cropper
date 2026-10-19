# Image cropper for React and Next.js

A reusable, controlled image-cropping dialog for React 18/19 and Next.js. Uses the real [Arc UI dialog](https://uiarc.dev/components/dialog) source with Radix accessibility, Motion transitions, and react-easy-crop positioning. Styling ships as plain CSS; consumers do not need Tailwind, shadcn configuration, or a component registry.

**Repository:** [salman-patel-eazr/image-cropper](https://github.com/salman-patel-eazr/image-cropper) (private). **Package import:** `@organization/image-cropper`. **Current release:** `v0.2.0`.

## Install in your React or Next.js project

You need React/React DOM 18.2+ or 19, Node.js 20.19+ (20.x) or 22.12+, and read access to this private repository. Ask the repository owner to add you under **Settings → Collaborators** and accept the invitation. Membership in a separate GitHub organization does not automatically grant access to this personal repository.

### Recommended: install the prebuilt release

Run these commands in your application's directory with [GitHub CLI](https://cli.github.com/) installed:

```sh
gh auth login
gh release download v0.2.0 --repo salman-patel-eazr/image-cropper --pattern "organization-image-cropper-0.2.0.tgz" --dir vendor
npm install ./vendor/organization-image-cropper-0.2.0.tgz
```

The archive already contains JavaScript, CSS, and TypeScript declarations. npm resolves the runtime dependencies. Commit the archive in `vendor/` with your application's package manifest and lockfile so teammates and CI can install the same local dependency. Images remain processed on the device. This distribution uses GitHub Releases; it does not require npm or GitHub Packages registry configuration.

### Alternative: install directly from GitHub

```sh
gh auth login
gh auth setup-git
npm install "git+https://github.com/salman-patel-eazr/image-cropper.git#v0.2.0"
```

The `prepare` script builds the package when installing from Git, following [npm's Git dependency lifecycle](https://docs.npmjs.com/cli/v11/commands/npm-install/). This needs development build dependencies, working Git credentials, and permitted install scripts. If your npm policy blocks lifecycle scripts, use the prebuilt release instead. In CI, give the Git client read access to this private repository using your existing GitHub App or token-based checkout credentials; never embed credentials in dependency URLs or committed files.

Pin a release tag as shown, and commit your consuming application's lockfile. To upgrade, download/install the new release or change the Git tag. The source and examples are available by cloning the repository below.

## Run the playground

```sh
gh repo clone salman-patel-eazr/image-cropper
cd image-cropper
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Try a preset, upload/drop an image, adjust the output and dialog dimensions, crop, and download the result. Editor preferences include dark mode.

### Run the Next.js example

From the repository root on Windows:

```powershell
cd examples/next-app
.\run.ps1
```

The launcher installs missing dependencies, builds the cropper package, and serves the example at **http://127.0.0.1:4317**. Use `.\run.ps1 -Port 4320` to choose another port. Press Ctrl+C to stop. See the [example README](examples/next-app/README.md) for macOS/Linux commands and PowerShell execution-policy instructions.

### Build an archive locally

```sh
# From the repository root; npm pack runs the prepare build automatically.
npm pack
# Run in the consuming application, with the actual archive path:
npm install /path/to/organization-image-cropper-0.2.0.tgz
```

Keep using `@organization/image-cropper` in imports, regardless of whether you install the Git URL or the release archive. The `private: true` flag prevents accidental registry publication; it does not prevent Git/archive installation. Project code is for internal use (`UNLICENSED`); third-party components retain their own licenses. No registry credentials are stored in this repository.

## Supported aspect ratios and size limits

Any positive ratio is supported when it matches the requested output dimensions within 0.1%. If omitted, `aspectRatio` is derived from `output.width / output.height`.

| Aspect ratio | Example output | Playground preset |
| --- | --- | --- |
| 1:1 | 512 × 512 | Profile photo |
| 16:9 | 1920 × 1080 | Cover image |
| 4:5 | 1080 × 1350 | Portrait |
| 9:16 | 1080 × 1920 | Story |
| Custom, e.g. 3:2 | 1200 × 800 | Enter custom width and height |

- **Custom dimensions:** `output.width` and `output.height` are positive integer dimensions. With the default `pixelRatio: 1`, these are the exact exported pixels. They are independent of screen size.
- **Custom resolution:** `output.pixelRatio` is a positive finite export multiplier (default 1). Use 2 or 3 for higher-resolution assets, 0.5 for smaller assets, or another custom value. Final pixel dimensions are `Math.round(width * pixelRatio)` and `Math.round(height * pixelRatio)`. Each final dimension must be 1–8192, with at most 32 million output pixels total. Fractional results round to whole pixels, so odd dimensions can vary slightly from the logical ratio.
- **Input bytes:** no package-imposed byte ceiling by default. Set `maxInputBytes` for `File`/`Blob` inputs. Available browser memory still limits large source images.
- **Output bytes:** no ceiling by default. Set `output.maxBytes` for a hard byte limit. JPEG/WebP quality is reduced without changing dimensions. An impossible limit shows an error; oversized PNGs also show an error.
- **Editor dimensions:** `viewport` caps the dialog in CSS pixels; it also fits the actual screen and scrolls if needed.

For example, `maxInputBytes={10 * 1024 * 1024}` accepts files up to 10 MiB, and `output.maxBytes: 500 * 1024` requests output up to 500 KiB.

### Custom dimensions, resolution and ratio together

```tsx
<ImageCropperDialog
  open={open}
  onOpenChange={setOpen}
  src={file}
  aspectRatio={13 / 7}
  output={{
    width: 1300,
    height: 700,
    pixelRatio: 2,          // Exports 2600 × 1400 actual pixels
    type: 'image/webp',
    quality: 0.9,
    maxBytes: 500 * 1024,   // Optional maximum exported bytes
  }}
  viewport={{ width: 900, height: 800 }}
  maxInputBytes={10 * 1024 * 1024}
  onCrop={result => upload(result.file)}
/>
```

`aspectRatio` accepts any positive numeric ratio, not just the demo presets. It defaults to `width / height`; supplying a conflicting ratio shows an error. `pixelRatio` changes export resolution, while `viewport` changes only the dialog's size. Scaling never automatically follows the device's pixel density. Resolution here means raster pixel dimensions; this API does not write custom print DPI/PPI metadata.

Use the exported helper to inspect the final resolution before opening the editor:

```ts
import { getOutputDimensions } from '@organization/image-cropper';

getOutputDimensions({ width: 1300, height: 700, pixelRatio: 2 });
// { width: 2600, height: 1400 }
```

The helper applies dimension/scale limits and throws for invalid dimensions or scale. `validateOptions(output, aspectRatio?)` additionally checks ratio, format, quality, and byte-limit options.

## React usage

```tsx
import { useState } from 'react';
import { ImageCropperDialog } from '@organization/image-cropper';
import type { CropResult } from '@organization/image-cropper';
import '@organization/image-cropper/styles.css';

export function PhotoField() {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<CropResult | null>(null);

  return <>
    <label>
      Choose a photo
      <input type="file" accept="image/*" onChange={event => {
        const selected = event.target.files?.[0];
        if (selected) { setFile(selected); setOpen(true); }
        event.target.value = '';
      }} />
    </label>
    {file && <ImageCropperDialog
      open={open}
      onOpenChange={setOpen}
      src={file}
      aspectRatio={16 / 9}
      output={{ width: 1600, height: 900, type: 'image/jpeg', maxBytes: 500 * 1024 }}
      viewport={{ width: 800, height: 850 }}
      maxInputBytes={20 * 1024 * 1024}
      onCrop={setResult}
    />}
    {result && <p>Ready to upload: {result.file.name} ({result.size} bytes)</p>}
  </>;
}
```

`onCrop` may return a promise. The dialog shows a saving state and closes when it resolves. If it throws, the dialog stays open with the error and calls `onError`. Upload through your application's existing API, for example by appending `result.file` to `FormData`. The package itself sends no image data to a server. A string URL still loads the image from that URL.

## Next.js App Router

Use the same component inside a file beginning with `'use client'`. Import `@organization/image-cropper/styles.css` in `app/layout.tsx` (Pages Router: `pages/_app.tsx`). The distributed JavaScript retains its `'use client'` directive. Browser globals are accessed only in effects or event handlers. Event callbacks must be defined in a client component.

See [examples/next-app](examples/next-app) for a complete consuming application. A dynamic import with `ssr: false` is optional if you want to defer the editor's load; it is not required for normal usage.

## Props

| Prop | Purpose |
| --- | --- |
| `open`, `onOpenChange` | Required controlled dialog state. Cancellation/closing reports `false`. |
| `src` | Required `File`, `Blob`, or image URL/data URL. Remote URLs must permit CORS. |
| `output` | Required `{ width, height, pixelRatio?, type?, quality?, maxBytes?, background? }`. Exported dimensions are `round(width * pixelRatio)` × `round(height * pixelRatio)`; `pixelRatio` defaults to 1. |
| `aspectRatio` | Optional positive number such as `16 / 9`. Defaults to the output ratio. Must match output dimensions within 0.1%; mismatches show an error instead of stretching. |
| `viewport` | Optional `{ width, height }` in CSS pixels. Caps the dialog dimensions, further clamped to the actual browser viewport; content scrolls when needed. Defaults to 920 × 780. |
| `onCrop` | Required `(result: CropResult) => void \| Promise<void>`. |
| `onError` | Optional load, validation, encoding, or callback error handler. Errors are also visible in the dialog. |
| `maxInputBytes` | Optional input file-size limit. Requires a `File` or `Blob`; fetch URLs as blobs before using this limit. |
| `maxZoom` | Maximum relative zoom; default 3, minimum 1. |
| `allowRotation` | Show 90-degree rotation; default true. |
| `fileName` | Export basename; default `cropped-image`. Extension follows output format. |
| `title`, `description` | Customize dialog copy. |
| `theme` | `light` (default) or `dark`. |
| `className` | Additional class on the portaled dialog for organization styling. |

Output defaults: JPEG, quality `0.92`, `pixelRatio: 1`, white transparency background. PNG preserves alpha. JPEG/WebP quality is `0..1`. If `maxBytes` is set, quality is reduced while final pixel dimensions remain fixed. If even minimum quality exceeds the limit, export fails with an actionable message. PNG cannot be reduced through quality and fails if over the limit. Unsupported browser encoders fail rather than silently changing the requested format. Final dimensions after scaling must be in `1..8192` and total at most 32 megapixels. Upscaling is permitted with a visible sharpness warning; it cannot restore detail absent from the source.

`CropResult` contains `blob`, `file`, `width`, `height`, `type`, `size` in bytes, `rotation` in degrees, and the pixel `crop` region in the rotated image bounds. Result `width` and `height` are the actual final pixels after `pixelRatio` scaling, matching the encoded image. No object URL is allocated for the result; create and revoke your own for previews:

```tsx
useEffect(() => {
  if (!result) return;
  const url = URL.createObjectURL(result.blob);
  setPreview(url);
  return () => URL.revokeObjectURL(url);
}, [result]);
```

Animated images export a still frame. HEIC and other formats need browser decode support or upstream conversion. Large source images still require browser decoding memory. Rasterization follows the browser's image orientation and color behavior; this is not a print color-management pipeline. Image metadata is not copied to the output.

## Organization styling

Arc foundation tokens are scoped to `.ic-theme` so importing the library does not reset your app's global theme. Use a custom class to override tokens:

```css
.my-cropper { --ic-accent: #17634f; --ic-accent-hover: #0d4939; --ic-stage-height: 380px; }
```

The dialog traps focus, supports Escape and keyboard crop movement, restores focus to the opening element when it is still present, and respects reduced-motion preferences. Arrow keys position the image; Tab reaches the zoom and transform controls. Wheel zoom is disabled to avoid interfering with page scrolling; use the slider or touch pinch.

## Build and verification

```sh
npm run build       # ESM library + bundled CSS + TypeScript declarations
npm run build:demo  # Static demo in demo-dist/
npm test           # Configuration and geometry contract tests
npx playwright install chromium
npm run test:e2e   # Browser flow, geometry pixels, output limits, focus and mobile bounds
```

Arc source and adaptations are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Dependencies remain dependencies rather than being inlined into the package; install the archive with npm so they are resolved. The library is ESM-only.

## Maintaining releases

The CI workflow runs the library build, unit tests, browser tests, demo build, and Next.js example build on pushes and pull requests. Releases are created explicitly by a maintainer, after checks pass:

1. Update `version` and lockfiles, update the README release tag and archive name, and commit the changes.
2. Run `npm pack`, which builds the distribution.
3. Create and push the matching version tag (for example `v0.2.1`).
4. Create a GitHub Release for that tag and attach the generated `.tgz` archive. Team members can then install that release with the commands above.

Keep release tags immutable; publish a new version for changes to an existing release.
