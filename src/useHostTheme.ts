import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CropperStyle, ImageCropperDialogProps } from './types';

const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const colorTokens = {
  background: ['--ic-background', '--popover', '--surface-raised', '--surface', '--background', '--mui-palette-background-paper', '--chakra-colors-bg-panel'],
  foreground: ['--ic-foreground', '--popover-foreground', '--foreground', '--text-primary', '--mui-palette-text-primary', '--chakra-colors-fg'],
  muted: ['--ic-muted', '--surface-muted', '--muted'],
  secondary: ['--ic-muted-foreground', '--text-secondary', '--muted-foreground', '--mui-palette-text-secondary', '--chakra-colors-fg-muted'],
  accent: ['--ic-accent', '--primary', '--accent', '--mui-palette-primary-main', '--chakra-colors-color-palette-solid'],
  'accent-hover': ['--ic-accent-hover'],
  'accent-foreground': ['--ic-accent-foreground', '--primary-foreground', '--accent-foreground', '--mui-palette-primary-contrastText', '--chakra-colors-color-palette-contrast'],
  border: ['--ic-border', '--border', '--border-color', '--mui-palette-divider', '--chakra-colors-border'],
  danger: ['--ic-danger', '--destructive', '--danger', '--mui-palette-error-main'],
  overlay: ['--ic-overlay']
} as const;

function color(value: string): string | undefined {
  if (!value) return;
  if (CSS.supports('color', value)) return value;
  // Legacy shadcn/Tailwind palettes store HSL channels without hsl().
  if (CSS.supports('color', `hsl(${value})`)) return `hsl(${value})`;
}

function isTransparent(value: string): boolean {
  return value === 'transparent'
    || (value.startsWith('rgba(') && /,\s*0(?:\.0+)?\s*\)$/.test(value))
    || /\/\s*0(?:\.0+)?%?\s*\)$/.test(value);
}

/** Snapshot inherited styles before portaling to body; observe only the theme's ancestors. */
export function useHostTheme(open: boolean, theme: ImageCropperDialogProps['theme'], themeRoot?: HTMLElement | null) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [snapshot, setSnapshot] = useState<{ style: CropperStyle; mode: 'light' | 'dark' } | null>(null);

  useClientLayoutEffect(() => {
    if (!open) return;
    const source = themeRoot ?? anchor.current?.parentElement;
    if (!source) return;
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const ancestors: HTMLElement[] = [];
    for (let node: HTMLElement | null = source; node; node = node.parentElement) ancestors.push(node);
    const capture = () => {
      const computed = getComputedStyle(source);
      const style: CropperStyle = {};
      // Preserve custom variables referenced by caller overrides; public --ic-* overrides
      // become fallback tokens so a class on the dialog can still take precedence.
      for (let i = 0; i < computed.length; i++) {
        const name = computed.item(i);
        if (name.startsWith('--') && !name.startsWith('--ic-')) style[name as `--${string}`] = computed.getPropertyValue(name).trim();
      }
      for (const [target, candidates] of Object.entries(colorTokens)) {
        for (const candidate of candidates) {
          const value = color(computed.getPropertyValue(candidate).trim());
          if (value) { style[`--ic-host-${target}`] = value; break; }
        }
      }
      const first = (...names: string[]) => names.map(name => computed.getPropertyValue(name).trim()).find(Boolean);
      style['--ic-host-font-family'] = first('--ic-font-family', '--font-body', '--font-sans') ?? computed.fontFamily;
      const headingFont = first('--ic-heading-font-family', '--font-heading', '--font-display');
      if (headingFont) style['--ic-host-heading-font-family'] = headingFont;
      style['--ic-host-font-size'] = first('--ic-font-size') ?? computed.fontSize;
      const lineHeight = parseFloat(computed.lineHeight) / parseFloat(computed.fontSize);
      style['--ic-host-line-height'] = first('--ic-line-height') ?? (Number.isFinite(lineHeight) ? String(lineHeight) : 'normal');
      style['--ic-host-letter-spacing'] = first('--ic-letter-spacing') ?? computed.letterSpacing;
      style['--ic-host-font-weight'] = computed.fontWeight;
      const radius = first('--ic-radius', '--radius', '--radius-surface');
      if (radius) style['--ic-host-radius'] = radius;
      let mode: 'light' | 'dark' | undefined = theme === 'light' || theme === 'dark' ? theme : undefined;
      if (!mode) {
        for (const node of ancestors) {
          const declared = node.getAttribute('data-theme') ?? node.getAttribute('data-color-scheme');
          if (declared === 'light' || declared === 'dark') { mode = declared; break; }
          if (node.classList.contains('dark')) { mode = 'dark'; break; }
          if (node.classList.contains('light')) { mode = 'light'; break; }
        }
      }
      mode ??= computed.colorScheme === 'dark' ? 'dark' : computed.colorScheme === 'light' ? 'light' : scheme.matches ? 'dark' : 'light';
      if (!theme || theme === 'inherit') {
        style['--ic-host-foreground'] ??= computed.color;
        if (!style['--ic-host-background']) {
          for (const node of ancestors) {
            const background = getComputedStyle(node).backgroundColor;
            if (!isTransparent(background)) { style['--ic-host-background'] = background; break; }
          }
        }
      }
      const next = { style, mode };
      setSnapshot(previous => previous?.mode === next.mode && JSON.stringify(previous.style) === JSON.stringify(style) ? previous : next);
    };
    capture();
    const observer = new MutationObserver(capture);
    for (const node of ancestors) observer.observe(node, { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-color-scheme'] });
    scheme.addEventListener('change', capture);
    window.addEventListener('resize', capture);
    return () => { observer.disconnect(); scheme.removeEventListener('change', capture); window.removeEventListener('resize', capture); };
  }, [open, theme, themeRoot]);

  return { anchor, snapshot };
}
