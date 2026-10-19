# Third-party sources

## Arc UI

Dialog source, dialog CSS, motion tokens, and foundation tokens were retrieved from the public Arc UI registry at https://uiarc.dev on 2026-10-15:

- https://uiarc.dev/r/dialog.json
- https://uiarc.dev/r/arc-motion-tokens.json
- https://uiarc.dev/r/arc-foundation.json

Arc UI declares its free components open source under MIT: https://uiarc.dev/docs/introduction. Original source paths were `registry/components/dialog/*`, `registry/motion-tokens.ts`, and `registry/foundation.css`. Local adaptations provide cropper sizing, use an SSR-safe layout effect, and remove panel scale animation to keep cropper measurements accurate during entrance. In v0.3.0 the fixed foundation palette was removed from the runtime and replaced with namespaced parent-theme fallbacks; dialog styling and overlay styling were adapted to inherit the host design system. No Pro components were used.

MIT License

Copyright: Arc UI contributors. Original copyright notices, where supplied, remain in source.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Runtime dependencies

Radix UI, Motion, Lucide, and react-easy-crop are installed from npm. Their licenses and attribution are included in their respective installed packages. They are external dependencies of this distribution.

## Playground photograph

The local sample was downloaded from https://images.unsplash.com/photo-1464822759023-fed622ff2c3b and is used only by the playground, outside the npm distribution. Unsplash license: https://unsplash.com/license.
