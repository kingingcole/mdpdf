// Common interfaces used across the application
export interface AssetOptions {
  assetDir: string;
}

export interface MdPdfOptions {
  source: string;
  destination: string;
  assetDir: string;
  ghStyle?: boolean;
  defaultStyle?: boolean;
  styles?: string[] | null;
  header?: string | null;
  footer?: string | null;
  noEmoji?: boolean;
  noHighlight?: boolean;
  debug?: string | null;
  waitUntil?: 'networkidle0' | 'networkidle2' | 'domcontentloaded' | 'load';
  pdf?: {
    title?: string | null;
    format?: string;
    orientation?: string;
    quality?: string;
    base?: string;
    header?: {
      height?: string | null;
    };
    footer?: {
      height?: string | null;
    };
    border?: {
      top?: string;
      left?: string;
      bottom?: string;
      right?: string;
    };
    timeout?: number | null;
  };
  layoutPath?: string;
}
