/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import _ from 'gmp/locale.js';

import {AUTO_DELETE_KEEP, AUTO_DELETE_NO} from 'gmp/models/task.js';

import PropTypes from '../../utils/proptypes.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Spinner from '../../components/form/spinner.js';

import Divider from '../../components/layout/divider.js';

const AutoDeleteReportsGroup = ({
  autoDelete = AUTO_DELETE_KEEP,
  autoDeleteData,
  onChange,
}) => (
  <FormGroup title={_('Auto Delete Reports')} flex="column">
    <Radio
      title={_('Do not automatically delete reports')}
      name="auto_delete"
      value={AUTO_DELETE_NO}
      onChange={onChange}
      checked={autoDelete !== AUTO_DELETE_KEEP}
    />
    <Divider>
      <Radio
        name="auto_delete"
        value="keep"
        onChange={onChange}
        title={_('Automatically delete oldest reports but always' +
          ' keep newest')}
        checked={autoDelete === AUTO_DELETE_KEEP}
      />
      <Spinner
        type="int"
        min="1"
        name="auto_delete_data"
        value={autoDeleteData}
        disabled={autoDelete !== AUTO_DELETE_KEEP}
        onChange={onChange}
      />
      <span>
        {_('reports')}
      </span>
    </Divider>
  </FormGroup>
);

AutoDeleteReportsGroup.propTypes = {
  autoDelete: PropTypes.oneOf([
    AUTO_DELETE_KEEP, AUTO_DELETE_NO,
  ]),
  autoDeleteData: PropTypes.number,
  onChange: PropTypes.func,
};

export default AutoDeleteReportsGroup;

// vim: set ts=2 sw=2 tw=80:
