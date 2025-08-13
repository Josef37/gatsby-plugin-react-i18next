import type {CreatePageArgs, Page} from 'gatsby';
import {match} from 'path-to-regexp';
import type {PageContext, PluginOptions} from '../types';

export const onCreatePage = async (
  {page, actions}: CreatePageArgs,
  pluginOptions: PluginOptions,
) => {
  const alreadyProcessed = typeof page.context?.i18n !== 'undefined';
  if (alreadyProcessed) {
    return;
  }

  const {createPage, deletePage} = actions;
  const {defaultLanguage, generateDefaultLanguagePage, languages, pages, pathTranslations} =
    pluginOptions;

  const pageOptions = pages.find((opt) => match(opt.matchPath)(page.path));

  const newPages: NewPageParams[] = [];

  let alternativeLanguages = generateDefaultLanguagePage
    ? languages
    : languages.filter((lng) => lng !== defaultLanguage);

  if (pageOptions?.excludeLanguages) {
    alternativeLanguages = alternativeLanguages.filter(
      (lng) => !pageOptions?.excludeLanguages?.includes(lng),
    );
  }

  if (pageOptions?.languages) {
    alternativeLanguages = generateDefaultLanguagePage
      ? pageOptions.languages
      : pageOptions.languages.filter((lng) => lng !== defaultLanguage);
  }

  if (pageOptions?.getLanguageFromPath) {
    const result = match<{lang: string}>(pageOptions.matchPath)(page.path);
    // We already matched above...
    if (!result) return;
    // When we don't find a matching language, better exit...
    const language = languages.find((lng) => lng === result.params.lang) ?? defaultLanguage;
    // TODO: This breaks when the language path is not the first starting with `/language`.
    // But otherwise we'd have no idea how to route stuff...
    const originalPath = page.path.replace(`/${language}`, '');
    // The original path is considered `routed`?
    const gotLanuageFromPath = Boolean(result.params.lang);
    const routed = gotLanuageFromPath;
    // Create a page with the same path, but give it `language` and `originalPath`
    newPages.push({language, originalPath, routed, languages: pageOptions?.languages});
    // We matched `:lang` (which was our whole purpose here)
    // and we don't exclude other languages.
    // So we consider this page to be the only one. Why?!
    // What we want: If we didn't get the language from the URL, we could say that this is a normal page
    // Otherwise just create the other languages like you meant.
    if (gotLanuageFromPath || !pageOptions.excludeLanguages) {
      alternativeLanguages = [];
    }
  } else {
    newPages.push({language: defaultLanguage, languages: pageOptions?.languages});
  }

  for (const altLanguage of alternativeLanguages) {
    let path = `/${altLanguage}${page.path}`;
    let matchPath = page.matchPath ? `/${altLanguage}${page.matchPath}` : undefined;

    const pathTranslation = pathTranslations?.[altLanguage]?.[page.path];
    if (pathTranslation) {
      path = pathTranslation;
      matchPath = page.matchPath?.replace(page.path, pathTranslation);
    }

    const is404Page = new RegExp('^/404/?$').test(page.path);
    if (is404Page) {
      matchPath = `/${altLanguage}/*`;
    }

    const newLocalePage: NewPageParams = {
      language: altLanguage,
      path,
      matchPath,
      routed: true,
      languages: pageOptions?.languages,
    };

    newPages.push(newLocalePage);
  }

  try {
    deletePage(page);
  } catch {}

  for (const newPage of newPages) {
    createPage(getNewPageFromOld(page, pluginOptions)(newPage));
  }
};

type NewPageParams = {
  language: string;
  path?: string;
  originalPath?: string;
  routed?: boolean;
  matchPath?: string;
  languages?: string[];
};

const getNewPageFromOld =
  (oldPage: Page, pluginOptions: PluginOptions) =>
  ({
    language,
    path = oldPage.path,
    originalPath = oldPage.path,
    routed = false,
    matchPath = oldPage.matchPath,
    languages,
  }: NewPageParams): Page<PageContext> => ({
    ...oldPage,
    path,
    matchPath,
    context: {
      ...oldPage.context,
      language,
      i18n: {
        path,
        originalPath,
        routed,
        language,
        languages: languages ?? pluginOptions.languages,
      },
    },
  });
