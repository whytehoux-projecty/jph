import { Source_Serif_4, Source_Sans_3, Source_Code_Pro } from 'next/font/google';

/**
 * Heritage Trust faces, shared by the portal and the commercial site.
 * next/font self-hosts them at build time (no runtime request to Google)
 * and serves them with font-display: swap. The CSS variables are consumed by
 * the --font-* tokens in app/styles/tokens.css.
 */
export const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const sourceSans = Source_Sans_3({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const sourceCode = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-source-code',
  display: 'swap',
  preload: false,
});

export const fontVariables = `${sourceSerif.variable} ${sourceSans.variable} ${sourceCode.variable}`;
