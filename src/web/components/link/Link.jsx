/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {Link as RLink} from 'react-router';
import styled from 'styled-components';
import {isDefined, isString} from 'gmp/utils/identity';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

RLink.displayName = 'RouterLink';

export const withTextOnly = Component => {
  const TextOnly = ({textOnly = false, ...props}) => {
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

    return <Component {...props} />;
  };

  TextOnly.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    textOnly: PropTypes.bool,
    title: PropTypes.string,
  };

  return TextOnly;
};

const LinkComponent = ({anchor, to = '', filter, query, ...other}) => {
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

LinkComponent.propTypes = {
  anchor: PropTypes.string,
  filter: PropTypes.oneOfType([PropTypes.filter, PropTypes.string]),
  query: PropTypes.object,
  to: PropTypes.string,
};

const Link = styled(withTextOnly(LinkComponent))`
  display: inline-flex;
  font-size: ${Theme.Font.defaultSize};
`;

export default Link;
