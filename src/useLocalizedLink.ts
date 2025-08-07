import {useContext} from 'react';
import {I18nextContext} from './i18nextContext';
import type {I18NextContext} from './types';
import {parseUrl, toggleTrailingSlash} from './utils';

interface Props {
  to: string;
  language?: string;
}
interface Result {
  to: string;
  language: string;
}

/**
 * This hook is intended _only_ for links to pages handled by Gatsby.
 *
 * It localizes the given path (`to`), keeping URL parameters.
 *
 * If a `pathTranslation` is found, it will be applied.
 * Otherwise the path is prefixed with the target language.
 *
 * Use the `language` parameter to override the target language.
 * Defaults to the language of the current page.
 */
const useLocalizedLink = ({to, language: languageOverride}: Props): Result => {
  const context = useContext(I18nextContext);

  const language = languageOverride ?? context.language;
  const toLocalized =
    getPathTranslation({context, language, path: to}) ??
    getPrefixedPath({context, language, path: to});

  return {to: toLocalized, language};
};

const getPathTranslation = ({
  path,
  language,
  context: {pathTranslations}
}: {
  path: string;
  language: string;
  context: I18NextContext;
}) => {
  const urlParts = parseUrl(path);
  if (!urlParts) return undefined;

  const {pathname, search, hash} = urlParts;

  const pathTranslation = pathTranslations?.[language]?.[pathname];
  if (pathTranslation) return [pathTranslation, search, hash].join('');

  const altPathname = toggleTrailingSlash(pathname);

  const altPathTranslation = pathTranslations?.[language]?.[altPathname];
  if (altPathTranslation) return [toggleTrailingSlash(altPathTranslation), search, hash].join('');

  return undefined;
};

const getPrefixedPath = ({
  path,
  language,
  context: {generateDefaultLanguagePage, defaultLanguage}
}: {
  path: string;
  language: string;
  context: I18NextContext;
}) => {
  const hasPrefix = generateDefaultLanguagePage || language !== defaultLanguage;
  return hasPrefix ? `/${language}${path}` : path;
};

export default useLocalizedLink;
