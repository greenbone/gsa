/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import {Link as RLink} from 'react-router-dom';

import {isDefined, isString} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

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

let Link = ({anchor, to = '', filter, query, ...other}) => {
  let pathname = '';

  if (to.startsWith('/')) {
    pathname += to;
  } else {
    pathname += '/' + to;
  }

  const location = {
    pathname,
    query: isDefined(query) ? {...query} : {},
    hash: isDefined(anchor) ? '#' + anchor : undefined,
  };

  if (isDefined(filter)) {
    location.query.filter = isString(filter) ? filter : filter.toFilterString();
  }
  return <RLink {...other} to={location} />;
};

Link.propTypes = {
  anchor: PropTypes.string,
  filter: PropTypes.oneOfType([PropTypes.filter, PropTypes.string]),
  query: PropTypes.object,
  to: PropTypes.string.isRequired,
};

Link = styled(withTextOnly(Link))`
  display: inline-flex;
`;

export default Link;

// vim: set ts=2 sw=2 tw=80:
