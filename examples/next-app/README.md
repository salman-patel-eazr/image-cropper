# Run the Next.js example

From this folder in PowerShell:

```powershell
.\run.ps1
```

The script installs missing dependencies, builds the local cropper package, and starts the example at http://127.0.0.1:4317. Press Ctrl+C to stop. It also works when invoked from another directory.

This example uses a custom 13:7 ratio with a logical size of 650 × 350 and `pixelRatio: 2`, exporting a 1300 × 700 PNG. Change the `output`, `aspectRatio`, and `viewport` props in `app/page.tsx` to fit your application's requirements. The main Vite playground also has editable width, height, resolution scale, file size, and dialog dimensions.

Use **Toggle host theme** before selecting a file to try the parent's light/dark palettes. The tokens live on the scoped `.host-example` wrapper in `app/globals.css`; the cropper inherits them and the page typography without a `theme` prop or cropper-specific palette.

To choose another port:

```powershell
.\run.ps1 -Port 4320
```

If PowerShell blocks local scripts, run this single invocation:

```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

For macOS/Linux, or to run manually:

```sh
# From image-cropper/
npm ci
npm run build
cd examples/next-app
npm ci
npm run dev -- --hostname 127.0.0.1 --port 4317
```
