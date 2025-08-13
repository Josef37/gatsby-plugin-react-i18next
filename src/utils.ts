import {withPrefix} from 'gatsby';

export const pick = <T extends {}, K extends keyof T>(obj: T, ...keys: K[]) =>
  Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]])) as Pick<T, K>;

export const parseUrl = (url: string): Pick<URL, 'pathname' | 'search' | 'hash'> | null => {
  // URL parsing needs a base, but we don't care about which.
  const urlParts = URL.parse(url, 'https://example.com');
  if (!urlParts) return null;
  return pick(urlParts, 'pathname', 'search', 'hash');
};

export const toggleTrailingSlash = (pathname: string) => {
  return pathname.endsWith('/') ? pathname.slice(0, -1) : `${pathname}/`;
};

export const stripTrailingSlash = (pathname: string) => {
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

export const removePathPrefix = (pathname: string, shouldStripTrailingSlash?: boolean) => {
  // We need to strip the trailing slash before matching, because `pathname` might not have a trailing slash.
  const pathPrefix = stripTrailingSlash(withPrefix('/'));

  let result = pathname;

  if (pathname.startsWith(pathPrefix)) {
    result = pathname.replace(pathPrefix, '');
  }

  if (shouldStripTrailingSlash) {
    result = stripTrailingSlash(result);
  }

  return result;
};
