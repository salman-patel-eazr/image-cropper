# Run the Next.js example

From this folder in PowerShell:

```powershell
.\run.ps1
```

The script installs missing dependencies, builds the local cropper package, and starts the example at http://127.0.0.1:4317. Press Ctrl+C to stop. It also works when invoked from another directory.

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
