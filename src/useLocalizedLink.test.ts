import {I18NextContext} from './types';
import {getLocalizedLink} from './useLocalizedLink';

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

const getContext = (newContext: Partial<I18NextContext>) => ({
  ...defaultContext,
  ...newContext
});

describe('without path translations', () => {
  test('correct prefix', () => {
    expect(getLocalizedLink(getContext({language: 'de'}), {to: '/path'})).toEqual({
      to: '/de/path',
      language: 'de'
    });

    expect(getLocalizedLink(getContext({language: 'de'}), {to: '/path'})).toEqual({
      to: '/de/path',
      language: 'de'
    });

    expect(getLocalizedLink(getContext({language: 'es'}), {to: '/path'})).toEqual({
      to: '/es/path',
      language: 'es'
    });

    expect(getLocalizedLink(getContext({language: 'en'}), {to: '/path'})).toEqual({
      to: '/path',
      language: 'en'
    });
  });

  test('default language options', () => {
    const baseContext = {language: 'de', defaultLanguage: 'de'};

    {
      const context = getContext({...baseContext, generateDefaultLanguagePage: true});
      expect(getLocalizedLink(context, {to: '/path'})).toEqual({to: '/de/path', language: 'de'});
    }
    {
      const context = getContext({...baseContext, generateDefaultLanguagePage: false});
      expect(getLocalizedLink(context, {to: '/path'})).toEqual({to: '/path', language: 'de'});
    }
  });

  test('language override', () => {
    expect(getLocalizedLink(getContext({language: 'en'}), {to: '/path'})).toEqual({
      to: '/path',
      language: 'en'
    });

    expect(getLocalizedLink(getContext({language: 'en'}), {to: '/path', language: 'de'})).toEqual({
      to: '/de/path',
      language: 'de'
    });
  });

  test('trailing slashes', () => {
    expect(getLocalizedLink(getContext({language: 'de'}), {to: '/path/'})).toEqual({
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
    {
      const context = getContext({language: 'de', pathTranslations});
      expect(getLocalizedLink(context, {to: '/path'}).to).toEqual('/pfad');
      expect(getLocalizedLink(context, {to: '/other'}).to).toEqual('/de/other');
    }
    {
      const context = getContext({language: 'es', pathTranslations});
      expect(getLocalizedLink(context, {to: '/path'}).to).toEqual('/es/path');
      expect(getLocalizedLink(context, {to: '/other'}).to).toEqual('/otros');
    }
    {
      const context = getContext({language: 'en', pathTranslations});
      expect(getLocalizedLink(context, {to: '/path'}).to).toEqual('/path');
      expect(getLocalizedLink(context, {to: '/other'}).to).toEqual('/other');
    }
  });

  test('language override', () => {
    const context = getContext({language: 'es', pathTranslations});
    expect(getLocalizedLink(context, {to: '/path', language: 'de'})).toEqual({
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
    const context = getContext({language: 'de', pathTranslations});
    expect(getLocalizedLink(context, {to: '/path-with'}).to).toEqual('/pfad-mit');
    expect(getLocalizedLink(context, {to: '/path-without/'}).to).toEqual('/pfad-ohne/');
    expect(getLocalizedLink(context, {to: '/path-mixed/'}).to).toEqual('/pfad-gemischt');
    expect(getLocalizedLink(context, {to: '/path-mixed'}).to).toEqual('/pfad-gemischt/');
  });

  test('url parameters', () => {
    const pathTranslations = {
      de: {'/path': '/pfad'}
    };
    const context = getContext({language: 'de', pathTranslations});
    expect(getLocalizedLink(context, {to: '/path?foo'}).to).toEqual('/pfad?foo');
    expect(getLocalizedLink(context, {to: '/path?foo=1'}).to).toEqual('/pfad?foo=1');
    expect(getLocalizedLink(context, {to: '/path?foo=bar'}).to).toEqual('/pfad?foo=bar');
    expect(getLocalizedLink(context, {to: '/path#foo'}).to).toEqual('/pfad#foo');
    expect(getLocalizedLink(context, {to: '/path?foo#baz'}).to).toEqual('/pfad?foo#baz');
    expect(getLocalizedLink(context, {to: '/path?foo=bar#baz'}).to).toEqual('/pfad?foo=bar#baz');
  });
});
