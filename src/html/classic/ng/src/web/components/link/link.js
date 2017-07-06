/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import glamorous from 'glamorous';

import {Link as RLink} from 'react-router';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

RLink.displayName = 'RouterLink';

export const withTextOnly = Component => {
  const TextOnly = ({
    textOnly = false,
    ...props
  }) => {
    if (textOnly) {
      const {className, children, style, title} = props;
      return (
        <span {...{className, children, style, title}}/>
      );
    }

    return <Component {...props}/>;
  };

  TextOnly.propTypes = {
    textOnly: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    title: PropTypes.string,
  };

  return TextOnly;
};

let Link = ({
  to,
  filter,
  ...other
}) => {

  let pathname = '/ng';

  if (to.startsWith('/')) {
    pathname += to;
  }
  else {
    pathname += "/" + to;
  }

  let location = {
    pathname,
    query: {},
  };

  if (is_defined(filter)) {
    location.query.filter = filter;
  }
  return <RLink {...other} to={location}/>;
};

Link.propTypes = {
  to: PropTypes.string.isRequired,
  filter: PropTypes.string,
};

Link = glamorous(
  withTextOnly(Link),
  {displayName: 'Link'},
)({
  display: 'flex',
});

export default Link;

// vim: set ts=2 sw=2 tw=80:
