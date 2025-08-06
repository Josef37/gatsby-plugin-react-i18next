import React, {useContext} from 'react';
import {I18nextContext} from './i18nextContext';
import {Link as GatsbyLink, type GatsbyLinkProps} from 'gatsby';
import {LANGUAGE_KEY} from './constants';
import useLocalizedUrl from './useLocalizedUrl';

type Props = GatsbyLinkProps<any> & {language?: string};

export const Link = React.forwardRef<HTMLAnchorElement, Props>(
  ({language, to, onClick, ...rest}, ref) => {
    const {url, urlLanguage} = useLocalizedUrl({to, language});

    return (
      <GatsbyLink
        {...rest}
        to={url}
        innerRef={ref}
        hrefLang={urlLanguage}
        onClick={(e) => {
          if (language) {
            localStorage.setItem(LANGUAGE_KEY, language);
          }
          if (onClick) {
            onClick(e);
          }
        }}
      />
    );
  }
);
