import type {InitOptions} from 'i18next';
import type {Node, NodeInput} from 'gatsby';

export type {Resource, ResourceLanguage, ResourceKey} from 'i18next';

type Language = string;
type Path = string;

export type PageOptions = {
  matchPath: string;
  getLanguageFromPath?: boolean;
  excludeLanguages?: Language[];
  languages?: Language[];
};

export type PluginOptions = {
  languages: Language[];
  defaultLanguage: Language;
  generateDefaultLanguagePage: boolean;
  redirect?: boolean;
  siteUrl?: string;
  i18nextOptions: InitOptions;
  pages?: Array<PageOptions>;
  pathTranslations?: Record<Language, Record<Path, Path>>;
  localeJsonSourceName?: string;
  localeJsonNodeName?: string;
  fallbackLanguage?: Language;
  trailingSlash?: 'always' | 'never' | 'ignore';
  verbose?: boolean;
};

export type I18NextContext = {
  language: Language;
  routed: boolean;
  languages: Language[];
  defaultLanguage: Language;
  generateDefaultLanguagePage: boolean;
  originalPath: Path;
  path: Path;
  siteUrl?: string;
  pathTranslations: PluginOptions['pathTranslations'];
};

export type PageContext = {
  path?: Path;
  language: Language;
  i18n: I18NextContext;
};

// Taken from https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-filesystem/index.d.ts
// No way to refer it without directly depending on gatsby-source-filesystem.
export interface FileSystemNode extends Node {
  absolutePath: string;
  accessTime: string;
  birthTime: Date;
  changeTime: string;
  extension: string;
  modifiedTime: string;
  prettySize: string;
  relativeDirectory: string;
  relativePath: string;
  sourceInstanceName: string;

  // parsed path typings
  base: string;
  dir: string;
  ext: string;
  name: string;
  root: string;

  // stats
  atime: Date;
  atimeMs: number;
  /**
   * @deprecated Use `birthTime` instead
   */
  birthtime: Date;
  /**
   * @deprecated Use `birthTime` instead
   */
  birthtimeMs: number;
  ctime: Date;
  ctimeMs: number;
  gid: number;
  mode: number;
  mtime: Date;
  mtimeMs: number;
  size: number;
  uid: number;
}

export interface LocaleNodeInput extends NodeInput {
  language: Language;
  ns: string;
  data: string;
  fileAbsolutePath: string;
}

export interface LocaleNode extends LocaleNodeInput {
  parent: string;
  children: string[];
  internal: NodeInput['internal'] & {
    owner: string;
  };
}
