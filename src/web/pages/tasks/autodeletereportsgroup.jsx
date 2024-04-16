/* Copyright (C) 2017-2022 Greenbone AG
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

import {AUTO_DELETE_KEEP, AUTO_DELETE_NO} from 'gmp/models/task';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Spinner from 'web/components/form/spinner';

import Row from 'web/components/layout/row';

import useTranslation from 'web/hooks/useTranslation';

const AutoDeleteReportsGroup = ({
  autoDelete = AUTO_DELETE_NO,
  autoDeleteData,
  onChange,
}) => {
  const [_] = useTranslation();
  return (
    <FormGroup title={_('Auto Delete Reports')}>
      <Radio
        title={_('Do not automatically delete reports')}
        name="auto_delete"
        value={AUTO_DELETE_NO}
        onChange={onChange}
        checked={autoDelete !== AUTO_DELETE_KEEP}
      />
      <Row>
        <Radio
          name="auto_delete"
          value="keep"
          onChange={onChange}
          title={_(
            'Automatically delete oldest reports but always keep newest',
          )}
          checked={autoDelete === AUTO_DELETE_KEEP}
        />
        <Spinner
          grow="1"
          type="int"
          min="2"
          max="1200"
          name="auto_delete_data"
          value={autoDeleteData}
          disabled={autoDelete !== AUTO_DELETE_KEEP}
          onChange={onChange}
        />
        <span>{_('reports')}</span>
      </Row>
    </FormGroup>
  );
};

AutoDeleteReportsGroup.propTypes = {
  autoDelete: PropTypes.oneOf([AUTO_DELETE_KEEP, AUTO_DELETE_NO]),
  autoDeleteData: PropTypes.number,
  onChange: PropTypes.func,
};

export default AutoDeleteReportsGroup;

// vim: set ts=2 sw=2 tw=80:
