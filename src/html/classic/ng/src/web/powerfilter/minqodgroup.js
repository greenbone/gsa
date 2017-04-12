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
import {is_defined} from '../../utils.js';

import PropTypes from '../proptypes.js';

import FormGroup from '../form/formgroup.js';
import Spinner from '../form/spinner.js';
import Text from '../form/text.js';

const MinQodGroup = ({qod, onChange, filter, name = 'min_qod'}) => {
  if (!is_defined(qod) && is_defined(filter)) {
    qod = filter.get('min_qod');
  }
  return (
    <FormGroup title={_('QoD')}>
      <Text>{_('must be at least')}</Text>
      <Spinner
        type="int"
        name={name}
        min="0" max="100"
        step="1"
        value={qod}
        size="1"
        onChange={onChange}/>
    </FormGroup>
  );
};

MinQodGroup.propTypes = {
  name: PropTypes.string,
  qod: PropTypes.number,
  filter: PropTypes.filter,
  onChange: PropTypes.func,
};

export default MinQodGroup;

// vim: set ts=2 sw=2 tw=80:
