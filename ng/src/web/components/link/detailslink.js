/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import Link from './link.js';

const types = {
  os: 'operatingsystem',
};

const checkType = type => {
  const ctype = types[type];
  if (is_defined(ctype)) {
    return ctype;
  }
  return type;
};

const DetailsLink = ({
  id,
  type,
  textOnly = false,
  ...props
}, {capabilities}) => {

  textOnly = textOnly || !capabilities.mayAccess(type);

  return (
    <Link
      {...props}
      textOnly={textOnly}
      to={'/' + checkType(type) + '/' + encodeURIComponent(id)}
    />
  );
};

DetailsLink.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

DetailsLink.propTypes = {
  id: PropTypes.id.isRequired,
  textOnly: PropTypes.bool,
  type: PropTypes.string.isRequired,
};

export default DetailsLink;

// vim: set ts=2 sw=2 tw=80:
