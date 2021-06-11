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

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Spinner from 'web/components/form/spinner';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';
import {toBoolean} from './dialog';

const AutoDeleteReportsGroup = ({
  autoDelete = false,
  autoDeleteReports,
  onChange,
}) => (
  <FormGroup title={_('Auto Delete Reports')} flex="column">
    <Radio
      title={_('Do not automatically delete reports')}
      name="autoDelete"
      value={false}
      onChange={onChange}
      checked={autoDelete === false}
      convert={toBoolean}
    />
    <Divider>
      <Radio
        name="autoDelete"
        value={true}
        onChange={onChange}
        title={_('Automatically delete oldest reports but always keep newest')}
        checked={autoDelete === true}
        convert={toBoolean}
      />
      <Spinner
        type="int"
        min="2"
        max="1200"
        name="autoDeleteReports"
        value={autoDeleteReports}
        disabled={autoDelete === false}
        onChange={onChange}
      />
      <span>{_('reports')}</span>
    </Divider>
  </FormGroup>
);

AutoDeleteReportsGroup.propTypes = {
  autoDelete: PropTypes.bool,
  autoDeleteReports: PropTypes.number,
  onChange: PropTypes.func,
};

export default AutoDeleteReportsGroup;

// vim: set ts=2 sw=2 tw=80:
