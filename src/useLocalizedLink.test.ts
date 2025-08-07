import {I18NextContext} from './types';
import useLocalizedLink from './useLocalizedLink';
import react from 'react';
jest.mock('react');

const defaultContext = {
  language: 'en',
  languages: ['en'],
  routed: false,
  defaultLanguage: 'en',
  generateDefaultLanguagePage: false,
  originalPath: '/',
  path: '/',
  pathTranslations: {}
};

const setContext = (context: Partial<I18NextContext>) => {
  jest.mocked(react).useContext.mockReturnValue({
    ...defaultContext,
    ...context
  });
};

describe('without path translations', () => {
  test('correct prefix', () => {
    setContext({language: 'de'});
    expect(useLocalizedLink({to: '/path'})).toEqual({
      to: '/de/path',
      language: 'de'
    });

    setContext({language: 'es'});
    expect(useLocalizedLink({to: '/path'})).toEqual({
      to: '/es/path',
      language: 'es'
    });

    setContext({language: 'en'});
    expect(useLocalizedLink({to: '/path'})).toEqual({
      to: '/path',
      language: 'en'
    });
  });

  test('default language options', () => {
    const context = {language: 'de', defaultLanguage: 'de'};

    setContext({...context, generateDefaultLanguagePage: true});
    expect(useLocalizedLink({to: '/path'})).toEqual({
      to: '/de/path',
      language: 'de'
    });

    setContext({...context, generateDefaultLanguagePage: false});
    expect(useLocalizedLink({to: '/path'})).toEqual({
      to: '/path',
      language: 'de'
    });
  });

  test('language override', () => {
    setContext({language: 'en'});
    expect(useLocalizedLink({to: '/path'})).toEqual({
      to: '/path',
      language: 'en'
    });

    setContext({language: 'en'});
    expect(useLocalizedLink({to: '/path', language: 'de'})).toEqual({
      to: '/de/path',
      language: 'de'
    });
  });

  test('trailing slashes', () => {
    setContext({language: 'de'});
    expect(useLocalizedLink({to: '/path/'})).toEqual({
      to: '/de/path/',
      language: 'de'
    });
  });
});

describe('with path translations', () => {
  const pathTranslations = {
    de: {'/path': '/pfad'},
    es: {'/other': '/otros'}
  };

  test('correct translation', () => {
    setContext({language: 'de', pathTranslations});
    expect(useLocalizedLink({to: '/path'}).to).toEqual('/pfad');
    expect(useLocalizedLink({to: '/other'}).to).toEqual('/de/other');

    setContext({language: 'es', pathTranslations});
    expect(useLocalizedLink({to: '/path'}).to).toEqual('/es/path');
    expect(useLocalizedLink({to: '/other'}).to).toEqual('/otros');

    setContext({language: 'en', pathTranslations});
    expect(useLocalizedLink({to: '/path'}).to).toEqual('/path');
    expect(useLocalizedLink({to: '/other'}).to).toEqual('/other');
  });

  test('language override', () => {
    setContext({language: 'es', pathTranslations});
    expect(useLocalizedLink({to: '/path', language: 'de'})).toEqual({
      to: '/pfad',
      language: 'de'
    });
  });

  test('trailing slashes', () => {
    const pathTranslations = {
      de: {
        '/path-with/': '/pfad-mit/',
        '/path-without': '/pfad-ohne',
        '/path-mixed': '/pfad-gemischt/' // will result in weird behavior
      }
    };
    setContext({language: 'de', pathTranslations});
    expect(useLocalizedLink({to: '/path-with'}).to).toEqual('/pfad-mit');
    expect(useLocalizedLink({to: '/path-without/'}).to).toEqual('/pfad-ohne/');
    expect(useLocalizedLink({to: '/path-mixed/'}).to).toEqual('/pfad-gemischt');
    expect(useLocalizedLink({to: '/path-mixed'}).to).toEqual('/pfad-gemischt/');
  });

  test('url parameters', () => {
    const pathTranslations = {
      de: {'/path': '/pfad'}
    };
    setContext({language: 'de', pathTranslations});
    expect(useLocalizedLink({to: '/path?foo'}).to).toEqual('/pfad?foo');
    expect(useLocalizedLink({to: '/path?foo=1'}).to).toEqual('/pfad?foo=1');
    expect(useLocalizedLink({to: '/path?foo=bar'}).to).toEqual('/pfad?foo=bar');
    expect(useLocalizedLink({to: '/path#foo'}).to).toEqual('/pfad#foo');
    expect(useLocalizedLink({to: '/path?foo#baz'}).to).toEqual('/pfad?foo#baz');
    expect(useLocalizedLink({to: '/path?foo=bar#baz'}).to).toEqual('/pfad?foo=bar#baz');
  });
});
