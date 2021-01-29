/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
      const {
        className,
        children,
        style,
        title,
        'data-testid': dataTestId,
      } = props;
      return (
        <span
          {...{
            className,
            children,
            title,
            style,
            'data-testid': dataTestId,
          }}
        />
      );
    }

    return <Component {...props} />;
  };

  TextOnly.propTypes = {
    className: PropTypes.string,
    'data-testid': PropTypes.string,
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
