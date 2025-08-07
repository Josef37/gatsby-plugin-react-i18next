import {useTranslation, type UseTranslationOptions} from 'react-i18next';
import type {Namespace} from 'i18next';
import {useCallback, useContext} from 'react';
import {navigate as gatsbyNavigate} from 'gatsby';
import {I18nextContext} from './i18nextContext';
import type {NavigateOptions} from '@reach/router';
import {LANGUAGE_STORAGE_KEY} from './constants';
import {getLocalizedLink} from './useLocalizedLink';
import {I18NextContext} from './types';

export const useI18next = (ns?: Namespace, options?: UseTranslationOptions<string>) => {
  const {i18n, t, ready} = useTranslation(ns, options);
  const context = useContext(I18nextContext);

  return {
    ...context,
    i18n,
    t,
    ready,
    navigate: useCallback(navigate(context), [context]),
    changeLanguage: useCallback(changeLanguage(context), [context])
  };
};

const navigate = (context: I18NextContext) => (to: string, options?: NavigateOptions<{}>) => {
  const link = getLocalizedLink(context, {to});
  gatsbyNavigate(link.to, options);
};

const changeLanguage =
  (context: I18NextContext) =>
  (language: string, to: string = context.originalPath, options?: NavigateOptions<{}>) => {
    const link = getLocalizedLink(context, {to, language});
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    gatsbyNavigate(link.to, options);
  };

export const forTesting = {navigate, changeLanguage};
