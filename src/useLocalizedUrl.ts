import {useContext} from 'react';
import {I18nextContext} from './i18nextContext';
import type {I18NextContext} from './types';

interface Props {
  to: string;
  language?: string;
}
interface Result {
  url: string;
  urlLanguage: string;
}

const getUrlTranslation = ({
  url,
  urlLanguage,
  context: {pathTranslations}
}: {
  url: string;
  urlLanguage: string;
  context: I18NextContext;
}) => {
  const urlParts = URL.parse(url, 'http://example.com'); // URL parsing needs a base, but we don't care which.
  if (!urlParts) return undefined;

  const {pathname, search, hash} = urlParts;

  const pathTranslation = pathTranslations?.[urlLanguage]?.[pathname];
  if (pathTranslation) return [pathTranslation, search, hash].join('');

  const altPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname + '/';

  const altPathTranslation = pathTranslations?.[urlLanguage]?.[altPathname];
  if (altPathTranslation) return [altPathTranslation, search, hash].join('');

  return undefined;
};

const getPrefixedUrl = ({
  url,
  urlLanguage,
  context: {generateDefaultLanguagePage, defaultLanguage}
}: {
  url: string;
  urlLanguage: string;
  context: I18NextContext;
}) => {
  const hasPrefix = generateDefaultLanguagePage || urlLanguage !== defaultLanguage;
  const prefix = hasPrefix ? `/${urlLanguage}` : '';
  const prefixedUrl = `${prefix}${url}`;
  return prefixedUrl;
};

const useLocalizedUrl = ({language, to}: Props): Result => {
  const context = useContext(I18nextContext);

  const urlLanguage = language ?? context.language;
  const url =
    getUrlTranslation({context, urlLanguage, url: to}) ??
    getPrefixedUrl({context, urlLanguage, url: to});

  return {url, urlLanguage};
};

export default useLocalizedUrl;
