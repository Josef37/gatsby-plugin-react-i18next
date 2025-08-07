import type {GatsbyNode} from 'gatsby';
import {DEFAULT_NODE_NAME, DEFAULT_SOURCE_NAME} from '../constants';

export const pluginOptionsSchema: Required<GatsbyNode>['pluginOptionsSchema'] = ({Joi}) => {
  const language = Joi.string().valid(Joi.in('/languages'));

  return Joi.object({
    languages: Joi.array()
      .items(Joi.string())
      .required()
      .description('Used languages - create a translations folder for each'),

    defaultLanguage: language
      .required()
      .description('Default language when visiting `/page` instead of `/:lang/page`'),

    generateDefaultLanguagePage: Joi.boolean()
      .default(false)
      .description('Generate dedicated page for default language e.g. /en/page'),

    redirect: Joi.boolean()
      .default(true)
      .description('Whether to automatically redirect the user to her preferred language'),

    siteUrl: Joi.string()
      .uri()
      .description('Public site URL, used to generate language-specific meta tags'),

    i18nextOptions: Joi.object()
      .default({})
      .description(
        'i18next configuration options. See https://www.i18next.com/overview/configuration-options',
      ),

    pages: Joi.array()
      .items(
        Joi.object({
          matchPath: Joi.string()
            .required()
            .description(
              'A path pattern like `/:lang?/blog/:uid`. Check [path-to-regexp](https://github.com/pillarjs/path-to-regexp) for more info.',
            ),
          getLanguageFromPath: Joi.boolean()
            .default(false)
            .description(
              'If set to `true` the language will be taken from the `:lang` param in the path instead of automatically generating a new page for each language.',
            ),
          excludeLanguages: Joi.array()
            .items(language)
            .description(
              [
                'The plugin will not generate pages for those languages.',
                'This option can be used to replace pages in some languages with custom ones.',
              ].join(' '),
            ),
          languages: Joi.array()
            .items(language)
            .description('The plugin will only generate pages only for those languages.'),
        }).xor('languages', 'excludeLanguages'),
      )
      .default([])
      .description('Array of page options to modify plugin behavior for specific pages'),

    pathTranslations: Joi.object()
      .pattern(language, Joi.object().pattern(Joi.string(), Joi.string()))
      .default({})
      .description('Path translations for each language'),

    localeJsonSourceName: Joi.string()
      .default(DEFAULT_SOURCE_NAME)
      .description('Name of JSON translation file nodes loaded by `gatsby-source-filesystem`'),

    localeJsonNodeName: Joi.string()
      .default(DEFAULT_NODE_NAME)
      .description('Name of GraphQL node that holds locale data'),

    fallbackLanguage: Joi.string().description(
      'Optional fallback to a different language than the defaultLanguage',
    ),

    trailingSlash: Joi.string()
      .valid('always', 'never', 'ignore')
      .default('always')
      .description('Use the same value as for the global option'),

    verbose: Joi.boolean()
      .default(true)
      .description('Whether to show activity timing output during build'),

    path: Joi.forbidden().messages({
      'any.unknown': [
        '"path" option is deprecated. Please remove it from config.',
        'As of v1.0.0, language JSON resources should be loaded by gatsby-source-filesystem plugin and then fetched by GraphQL query.',
        'It enables incremental build and hot-reload as language JSON files change.',
        'See details: https://github.com/microapps/gatsby-plugin-react-i18next',
      ].join(' '),
    }),
  });
};
