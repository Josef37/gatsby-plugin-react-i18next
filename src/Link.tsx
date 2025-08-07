import React, {useCallback} from 'react';
import {Link as GatsbyLink, type GatsbyLinkProps} from 'gatsby';
import {LANGUAGE_KEY} from './constants';
import useLocalizedLink from './useLocalizedLink';

type Props = GatsbyLinkProps<any> & {language?: string};

export const Link = React.forwardRef<HTMLAnchorElement, Props>(
  ({language, to, onClick, ...rest}, ref) => {
    const {to: toLocalized, language: hrefLang} = useLocalizedLink({to, language});

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (language) {
          localStorage.setItem(LANGUAGE_KEY, language);
        }
        if (onClick) {
          onClick(event);
        }
      },
      [language, onClick]
    );

    return (
      <GatsbyLink
        {...rest}
        to={toLocalized}
        // `innerRef` is marked as deprecated, but the Gatsby source does it the same way.
        innerRef={ref}
        hrefLang={hrefLang}
        onClick={handleClick}
      />
    );
  }
);
