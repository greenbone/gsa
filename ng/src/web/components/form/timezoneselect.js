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

import _ from 'gmp/locale.js';
import {map} from 'gmp/utils.js';
import timezones from 'gmp/timezones.js';

import PropTypes from '../../utils/proptypes.js';

import withLayout from '../layout/withLayout.js';

import Select from './select.js';


const TimeZoneSelectComponent = ({value = 'UTC', ...props}) => {

  const timezone_opts = map(timezones, zone => {
    return <option key={zone.name} value={zone.name}>{zone.name}</option>;
  });

  return (
    <Select {...props} value={value}>
      <option value="UTC">
        {_('Coordinated Universal Time/UTC')}
      </option>
      {timezone_opts}
    </Select>
  );
};

TimeZoneSelectComponent.propTypes = {
  value: PropTypes.string,
};

export default withLayout()(TimeZoneSelectComponent);

// vim: set ts=2 sw=2 tw=80:
