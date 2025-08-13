import gatsby from 'gatsby';
import {I18NextContext} from './types';
import {LANGUAGE_STORAGE_KEY} from './constants';
import {forTesting} from './useI18next';

const {navigate, changeLanguage} = forTesting;

jest.mock('gatsby', () => ({
  navigate: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {},
    ready: true,
  }),
}));

global.localStorage = {setItem: jest.fn()} as any;

const mockContext: I18NextContext = {
  language: 'en',
  languages: ['en', 'de'],
  routed: false,
  defaultLanguage: 'en',
  generateDefaultLanguagePage: false,
  originalPath: '/test-page',
  path: '/test-page',
  pathTranslations: {},
};

const getContext = (context: Partial<I18NextContext>) => ({
  ...mockContext,
  ...context,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('navigate', () => {
  it('navigates to localized paths', () => {
    const context = getContext({language: 'de'});

    navigate(context)('/new-page');

    expect(gatsby.navigate).toHaveBeenCalledWith('/de/new-page', undefined);
  });

  it('passes navigation options', () => {
    const context = getContext({});
    const options = {replace: true};

    navigate(context)('/new-page', options);

    expect(gatsby.navigate).toHaveBeenCalledWith('/new-page', options);
  });
});

describe('changeLanguage', () => {
  it('navigates to localized paths and stores new language', () => {
    const context = getContext({});

    changeLanguage(context)('de');

    expect(localStorage.setItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY, 'de');
    expect(gatsby.navigate).toHaveBeenCalledWith('/de/test-page', undefined);
  });

  it('passes navigation options', () => {
    const context = getContext({});
    const options = {replace: true};

    changeLanguage(context)('de', undefined, options);

    expect(gatsby.navigate).toHaveBeenCalledWith('/de/test-page', options);
  });
});

describe('path translations', () => {
  const pathTranslations = {
    de: {
      '/about': '/ueber-uns',
      '/products': '/produkte',
      '/contact/': '/kontakt/',
    },
  };

  it('uses translated paths when navigating', () => {
    const context = getContext({
      path: '/about',
      originalPath: '/about',
      pathTranslations,
    });

    changeLanguage(context)('de');

    expect(gatsby.navigate).toHaveBeenCalledWith('/ueber-uns', undefined);
  });

  it('preserves query parameters and hash in translated paths', () => {
    const context = getContext({
      path: '/products',
      originalPath: '/products',
      pathTranslations,
    });

    changeLanguage(context)('de', '/products?category=tools#pricing');

    expect(gatsby.navigate).toHaveBeenCalledWith('/produkte?category=tools#pricing', undefined);
  });

  it('handles paths with and without trailing slashes', () => {
    const context = getContext({language: 'de', pathTranslations});

    navigate(context)('/contact');
    navigate(context)('/contact/');

    expect(gatsby.navigate).toHaveBeenNthCalledWith(1, '/kontakt', undefined);
    expect(gatsby.navigate).toHaveBeenNthCalledWith(2, '/kontakt/', undefined);
  });

  it('falls back to language prefix for untranslated paths', () => {
    const context = getContext({
      path: '/blog',
      originalPath: '/blog',
      pathTranslations,
    });

    changeLanguage(context)('de');

    expect(gatsby.navigate).toHaveBeenCalledWith('/de/blog', undefined);
  });
});
