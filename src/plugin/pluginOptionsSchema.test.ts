import {testPluginOptionsSchema} from 'gatsby-plugin-utils';
import {pluginOptionsSchema} from './pluginOptionsSchema';

it(`should invalidate incorrect options`, async () => {
  const options = {
    languages: ['en', 'de'],
    defaultLanguage: 'it',
    pathTranslations: {
      it: {'/from': '/to'},
      de: {'/from': '/to'},
    },
    siteUrl: '/relative/path',
    pages: [
      {
        matchPath: '/some/path',
        excludeLanguages: ['it'],
        languages: ['de'],
      },
      {
        matchPath: '/:lang/blog',
        getLanguageFromPath: true,
        languages: ['de', 'it'],
      },
    ],
    path: 'anything',
  };
  const expectedErrors = [
    '"defaultLanguage" must be [ref:root:languages]',
    '"siteUrl" must be a valid uri',
    '"pages[0].excludeLanguages[0]" must be [ref:root:languages]',
    '"pages[0]" contains a conflict between exclusive peers [languages, excludeLanguages]',
    '"pages[1].languages[1]" must be [ref:root:languages]',
    '"pathTranslations.it" is not allowed',
  ];
  const deprecationError = '"path" option is deprecated.';

  const {isValid, errors} = await testPluginOptionsSchema(pluginOptionsSchema, options);

  expect(isValid).toBe(false);
  expect(errors.slice(0, -1)).toEqual(expectedErrors);
  expect(errors[errors.length - 1].startsWith(deprecationError)).toBe(true);
});

it(`should validate correct options`, async () => {
  const options = {
    languages: ['en', 'de'],
    defaultLanguage: 'de',
    generateDefaultLanguagePage: true,
    pathTranslations: {de: {'/from': '/to'}},
    siteUrl: 'http://example.com/some/path',
    pages: [
      {
        matchPath: '/:lang/blog',
        excludeLanguages: ['de'],
      },
    ],
  };
  const {isValid, errors} = await testPluginOptionsSchema(pluginOptionsSchema, options);

  expect(isValid).toBe(true);
  expect(errors).toEqual([]);
});
