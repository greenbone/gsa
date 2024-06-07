/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {AUTO_DELETE_KEEP, AUTO_DELETE_NO} from 'gmp/models/task';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Spinner from 'web/components/form/spinner';

import Divider from 'web/components/layout/divider';

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
