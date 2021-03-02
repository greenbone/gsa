/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {AUTO_DELETE_KEEP, AUTO_DELETE_NO} from 'gmp/models/task';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Spinner from 'web/components/form/spinner';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';

const AutoDeleteReportsGroup = ({
  autoDelete = AUTO_DELETE_NO,
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
        title={_('Automatically delete oldest reports but always keep newest')}
        checked={autoDelete === AUTO_DELETE_KEEP}
      />
      <Spinner
        type="int"
        min="2"
        max="1200"
        name="auto_delete_data"
        value={autoDeleteData}
        disabled={autoDelete !== AUTO_DELETE_KEEP}
        onChange={onChange}
      />
      <span>{_('reports')}</span>
    </Divider>
  </FormGroup>
);

AutoDeleteReportsGroup.propTypes = {
  autoDelete: PropTypes.oneOf([AUTO_DELETE_KEEP, AUTO_DELETE_NO]),
  autoDeleteData: PropTypes.number,
  onChange: PropTypes.func,
};

export default AutoDeleteReportsGroup;

// vim: set ts=2 sw=2 tw=80:
