/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {LinkProps as RLinkProps, Link as RLink} from 'react-router';
import styled from 'styled-components';
import Filter from 'gmp/models/filter';
import {isDefined, isString} from 'gmp/utils/identity';
import Theme from 'web/utils/Theme';

RLink.displayName = 'RouterLink';

interface WithTextOnlyProps {
  textOnly?: boolean;
}

interface WithTextOnlyComponentProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  children?: React.ReactNode;
}

export const withTextOnly = <TProps extends {}>(
  Component: React.ComponentType<TProps & WithTextOnlyComponentProps>,
) => {
  const TextOnly = ({
    textOnly = false,
    ...props
  }: TProps & WithTextOnlyComponentProps & WithTextOnlyProps) => {
    if (textOnly) {
      const {className, children, style, title} = props;
      return (
        <span
          {...{
            className,
            children,
            title,
            style,
          }}
        />
      );
    }

    return <Component {...(props as TProps & WithTextOnlyComponentProps)} />;
  };

  TextOnly.displayName = `withTextOnly(${Component.displayName ?? Component.name ?? 'Component'})`;

  return TextOnly;
};

interface LinkComponentProps extends Omit<RLinkProps, 'to'> {
  anchor?: string;
  to?: string;
  filter?: string | Filter;
  query?: Record<string, string>;
}

export type LinkProps = LinkComponentProps & WithTextOnlyProps;

const LinkComponent = ({
  anchor,
  to = '',
  filter,
  query,
  ...other
}: LinkComponentProps) => {
  let pathname = '';

  if (to.startsWith('/')) {
    pathname += to;
  } else {
    pathname += '/' + to;
  }

  const searchParams = new URLSearchParams(isDefined(query) ? query : {});
  if (isDefined(filter)) {
    searchParams.set(
      'filter',
      isString(filter) ? filter : filter.toFilterString(),
    );
  }

  const fullPath = {
    pathname,
    search: searchParams.toString().replace(/\+/g, '%20'),
    hash: isDefined(anchor) ? '#' + anchor : '',
  };

  return <RLink {...other} to={fullPath} />;
};

const Link = styled(withTextOnly(LinkComponent))`
  display: inline-flex;
  font-size: ${Theme.Font.defaultSize};
`;

export default Link;
