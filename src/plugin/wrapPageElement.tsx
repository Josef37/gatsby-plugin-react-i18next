import React, {useEffect} from 'react';
import {navigate, type WrapPageElementBrowserArgs, type PageProps} from 'gatsby';
import browserLang from 'browser-lang';
import {
  type I18NextContext,
  type PageContext,
  type PluginOptions,
  type Resource,
  type ResourceKey,
} from '../types';
import {LANGUAGE_STORAGE_KEY} from '../constants';
import i18next, {type i18n as I18n} from 'i18next';
import {I18nextProvider} from 'react-i18next';
import {I18nextContext} from '../i18nextContext';
import outdent from 'outdent';
import {getLocalizedLink} from '../useLocalizedLink';
import {pick, removePathPrefix} from '../utils';

type DataType = Record<string, unknown>;

const withI18next = (i18n: I18n, context: I18NextContext) => (children: any) => {
  return (
    <I18nextProvider i18n={i18n}>
      <I18nextContext.Provider value={context}>{children}</I18nextContext.Provider>
    </I18nextProvider>
  );
};

export const wrapPageElement = (
  {element, props}: WrapPageElementBrowserArgs<DataType, PageContext>,
  pluginOptions: PluginOptions,
): React.ReactElement => {
  const {language} = props.pageContext;
  const {i18nextOptions, defaultLanguage} = pluginOptions;

  useEffect(() => {
    // TODO: Only redirect on initial visit or every new page load?
    redirectToUserLocale(props, pluginOptions);
  }, []);

  const {resources, defaultNamespace, fallbackNamespaces} = getTranslationResources(
    props,
    pluginOptions,
  );

  // We're creating a new instance for each page, because the translation resources
  // are queried for every page and can differ.
  const i18n = i18next.createInstance({
    ...i18nextOptions,
    react: {
      ...i18nextOptions.react,
      useSuspense: false,
    },
  });

  i18n.init({
    resources,
    lng: language,
    fallbackLng: defaultLanguage,
    defaultNS: defaultNamespace,
    fallbackNS: fallbackNamespaces,
  });

  const context = {
    ...pick(
      pluginOptions,
      'defaultLanguage',
      'generateDefaultLanguagePage',
      'pathTranslations',
      'siteUrl',
    ),
    ...props.pageContext.i18n,
  };

  return withI18next(i18n, context)(element);
};

const redirectToUserLocale = (
  props: PageProps<DataType, PageContext>,
  pluginOptions: PluginOptions,
): string | undefined => {
  const {pageContext, location} = props;
  const {routed, language, languages} = pageContext.i18n;
  const {
    redirect,
    fallbackLanguage,
    trailingSlash,
    defaultLanguage,
    generateDefaultLanguagePage,
    pathTranslations,
  } = pluginOptions;

  const shouldRedirect = redirect && !routed;
  const isBrowser = typeof window !== 'undefined';

  if (!shouldRedirect || !isBrowser) {
    return;
  }

  let requestedLanguage =
    window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ||
    browserLang({
      languages,
      fallback: fallbackLanguage ?? language,
    });

  if (!languages.includes(requestedLanguage)) {
    requestedLanguage = language;
  }

  // TODO: Don't save the user language when we can't serve it?
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, requestedLanguage);

  // TODO: Also redirect when generating default language page.
  if (requestedLanguage === defaultLanguage) {
    return;
  }

  const shouldStripTrailingSlash = trailingSlash === 'never';
  const path = removePathPrefix(location.pathname, shouldStripTrailingSlash);

  const {to: newPath} = getLocalizedLink(
    {defaultLanguage, generateDefaultLanguagePage, pathTranslations},
    {to: path, language: requestedLanguage},
  );

  navigate(newPath, {replace: true});
};

const getTranslationResources = (
  props: PageProps<DataType, PageContext>,
  pluginOptions: PluginOptions,
) => {
  const {data, pageContext} = props;
  const {localeJsonNodeName, languages, i18nextOptions} = pluginOptions;

  const resources: Resource = {};

  const defaultNamespace =
    typeof i18nextOptions.defaultNS === 'string' ? i18nextOptions.defaultNS : 'translation';

  const localeNodesRaw = getLocaleNodesFromData(data, localeJsonNodeName);
  if (!validateLocaleNodes(localeNodesRaw)) {
    return {resources, defaultNamespace, fallbackNamespaces: []};
  }
  const localeNodes = normalizeLocaleNodes(localeNodesRaw, defaultNamespace);

  if (languages.length > 1 && localeNodes.length === 0 && process.env.NODE_ENV === 'development') {
    showQueryHint(pageContext, pluginOptions);
  }

  const namespaces = localeNodes.map((node) => node.namespace);
  // We want to set the default namespace and use other namespaces as fallback.
  // This way you dont need to specify namespaces in components.
  const fallbackNamespaces = namespaces.filter((namespace) => namespace !== defaultNamespace);

  for (const {data, language, namespace} of localeNodes) {
    const parsedData: ResourceKey = typeof data === 'object' ? data : JSON.parse(data);

    if (!(language in resources)) resources[language] = {};

    resources[language][namespace] = parsedData;
  }

  return {
    resources,
    defaultNamespace,
    fallbackNamespaces,
  };
};

const getLocaleNodesFromData = (data: DataType, localeJsonNodeName: string) => {
  const queryData = data?.[localeJsonNodeName];

  if (!queryData || typeof queryData !== 'object') {
    return [];
  } else if ('edges' in queryData && Array.isArray(queryData.edges)) {
    return queryData.edges.map((edge) => edge?.node);
  } else if ('nodes' in queryData) {
    return queryData.nodes;
  }

  return [];
};

type Node = {
  language: string;
  data: string;
  ns?: string;
  namespace?: string;
};
const validateLocaleNodes = (nodes: unknown): nodes is Array<Node> => {
  return (
    Array.isArray(nodes) &&
    nodes.every(
      (node) =>
        typeof node?.language === 'string' &&
        typeof node?.data === 'string' &&
        (typeof node?.namespace === 'string' || typeof node?.ns === 'string'),
    )
  );
};

const normalizeLocaleNodes = (nodes: Array<Node>, defaultNamespace: string) => {
  return nodes.map((node) => ({
    language: node.language,
    data: node.data,
    namespace: node.namespace ?? node.ns ?? defaultNamespace,
  }));
};

const showQueryHint = (pageContext: PageContext, {localeJsonNodeName}: PluginOptions) => {
  console.error(
    outdent`
      No translations were found in "${localeJsonNodeName}" key for "${pageContext.i18n.originalPath}". 
      You need to add a graphql query to every page like this:
      
      export const query = graphql\`
        query($language: String!) {
          ${localeJsonNodeName}: allLocale(language: {eq: $language}) {
            edges {
              node {
                namespace
                data
                language
              }
            }
          }
        }
      \`;
      `,
  );
};

export const forTesting = {
  redirectToUserLocale,
  getTranslationResources,
  getLocaleNodesFromData,
  validateLocaleNodes,
  normalizeLocaleNodes,
};
