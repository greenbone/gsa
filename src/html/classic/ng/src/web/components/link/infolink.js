/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import {is_defined} from '../../../utils.js';

import PropTypes from '../../utils/proptypes.js';

import LegacyLink from './legacylink.js';

const InfoLink = ({
  details = true,
  id,
  legacy = false,
  name,
  type,
  ...props,
}) => {
  if (is_defined(id)) {
    props.info_id = id; // eslint-disable-line react/prop-types
  }
  else if (is_defined(name)) {
    props.info_name = name; // eslint-disable-line react/prop-types
  }
  return (
    <LegacyLink
      {...props}
      cmd="get_info"
      details={details ? '1' : '0'}
      info_type={type}
    />
  );
};

InfoLink.propTypes = {
  details: PropTypes.bool,
  id: PropTypes.string,
  legacy: PropTypes.bool,
  name: PropTypes.string,
  type: PropTypes.string.isRequired,
};

export default InfoLink;

// vim: set ts=2 sw=2 tw=80:
