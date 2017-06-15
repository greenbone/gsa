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

import _ from '../../locale.js';
import {is_defined, parse_int} from '../../utils.js';

import PropTypes from '../proptypes.js';

import FormGroup from '../form/formgroup.js';
import YesNoRadio from '../form/yesnoradio.js';

const ApplyOverridesGroup = ({
    filter,
    name = 'apply_overrides',
    overrides,
    onChange,
  }) => {
  if (is_defined(filter)) {
    overrides = filter.get('apply_overrides');
  }
  return (
    <FormGroup title={_('Apply Overrides')}>
      <YesNoRadio
        value={overrides}
        name={name}
        yesValue={1}
        noValue={0}
        convert={parse_int}
        onChange={onChange}/>
    </FormGroup>
  );
};

ApplyOverridesGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  overrides: PropTypes.number,
  onChange: PropTypes.func,
};

export default ApplyOverridesGroup;

// vim: set ts=2 sw=2 tw=80:
