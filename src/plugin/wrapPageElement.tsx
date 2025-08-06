import React from 'react';
import {withPrefix, navigate, type WrapPageElementBrowserArgs} from 'gatsby';
// @ts-ignore
import browserLang from 'browser-lang';
import {
  type I18NextContext,
  type PageContext,
  type PluginOptions,
  type LocaleNode,
  type Resource,
  type ResourceKey
} from '../types';
import {LANGUAGE_KEY} from '../constants';
import i18next, {type i18n as I18n} from 'i18next';
import {I18nextProvider} from 'react-i18next';
import {I18nextContext} from '../i18nextContext';
import outdent from 'outdent';

const withI18next = (i18n: I18n, context: I18NextContext) => (children: any) => {
  return (
    <I18nextProvider i18n={i18n}>
      <I18nextContext.Provider value={context}>{children}</I18nextContext.Provider>
    </I18nextProvider>
  );
};

const removePathPrefix = (pathname: string, stripTrailingSlash: boolean) => {
  const pathPrefix = withPrefix('/');
  let result = pathname;

  if (pathname.startsWith(pathPrefix)) {
    result = pathname.replace(pathPrefix, '/');
  }

  if (stripTrailingSlash && result.endsWith('/')) {
    return result.slice(0, -1);
  }

  return result;
};

export const wrapPageElement = (
  {element, props}: WrapPageElementBrowserArgs<any, PageContext>,
  {
    i18nextOptions = {},
    redirect = true,
    generateDefaultLanguagePage = false,
    siteUrl,
    localeJsonNodeName = 'locales',
    fallbackLanguage,
    trailingSlash,
    pathTranslations = {}
  }: PluginOptions
) => {
  if (!props) return;
  const {data, pageContext, location} = props;
  const {routed, language, languages, originalPath, defaultLanguage, path} = pageContext.i18n;
  const shouldRedirect = redirect && !routed;

  const isBrowser = typeof window !== 'undefined';
  if (shouldRedirect && isBrowser) {
    let requestedLanguage =
      window.localStorage.getItem(LANGUAGE_KEY) ||
      browserLang({
        languages,
        fallback: fallbackLanguage || language
      });

    if (!languages.includes(requestedLanguage)) {
      requestedLanguage = language;
    }

    window.localStorage.setItem(LANGUAGE_KEY, requestedLanguage);

    if (requestedLanguage !== defaultLanguage) {
      const pathTranslation = pathTranslations?.[requestedLanguage]?.[originalPath];

      const stripTrailingSlash = trailingSlash === 'never';
      const path = removePathPrefix(location.pathname, stripTrailingSlash);

      const newPath = pathTranslation
        ? // TODO: Does replacing also work when the trailing slash is missing?
          path.replace(originalPath, pathTranslation)
        : `/${requestedLanguage}${path}`;

      const newUrl = `${newPath}${location.search}${location.hash}`;
      navigate(newUrl, {replace: true});
      return null;
    }
  }

  const localeNodes: Array<{node: LocaleNode}> = data?.[localeJsonNodeName]?.edges || [];

  if (languages.length > 1 && localeNodes.length === 0 && process.env.NODE_ENV === 'development') {
    console.error(
      outdent`
      No translations were found in "${localeJsonNodeName}" key for "${originalPath}". 
      You need to add a graphql query to every page like this:
      
      export const query = graphql\`
        query($language: String!) {
          ${localeJsonNodeName}: allLocale(language: {eq: $language}) {
            edges {
              node {
                ns
                data
                language
              }
            }
          }
        }
      \`;
      `
    );
  }

  const namespaces = localeNodes.map(({node}) => node.ns);

  // We want to set default namespace to a page namespace if it exists
  // and use other namespaces as fallback
  // this way you dont need to specify namespaces in pages
  let defaultNS = i18nextOptions.defaultNS?.toString() || 'translation';
  defaultNS = namespaces.find((ns) => ns !== defaultNS) || defaultNS;
  const fallbackNS = namespaces.filter((ns) => ns !== defaultNS);

  const resources: Resource = localeNodes.reduce<Resource>((res: Resource, {node}) => {
    const parsedData: ResourceKey =
      typeof node.data === 'object' ? node.data : JSON.parse(node.data);

    if (!(node.language in res)) res[node.language] = {};

    res[node.language][node.ns || defaultNS] = parsedData;

    return res;
  }, {});

  const i18n = i18next.createInstance();

  i18n.init({
    ...i18nextOptions,
    resources,
    lng: language,
    fallbackLng: defaultLanguage,
    defaultNS,
    fallbackNS,
    react: {
      ...i18nextOptions.react,
      useSuspense: false
    }
  });

  if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }

  const context = {
    routed,
    language,
    languages,
    originalPath,
    defaultLanguage,
    generateDefaultLanguagePage,
    siteUrl,
    path,
    pathTranslations
  };

  return withI18next(i18n, context)(element);
};
