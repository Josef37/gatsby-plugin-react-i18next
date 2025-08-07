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
