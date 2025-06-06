/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {AUTO_DELETE_KEEP, AUTO_DELETE_NO} from 'gmp/models/task';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Spinner from 'web/components/form/Spinner';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const AutoDeleteReportsGroup = ({
  autoDelete = AUTO_DELETE_NO,
  autoDeleteData,
  onChange,
}) => {
  const [_] = useTranslation();
  return (
    <FormGroup title={_('Auto Delete Reports')}>
      <Radio
        checked={autoDelete !== AUTO_DELETE_KEEP}
        name="auto_delete"
        title={_('Do not automatically delete reports')}
        value={AUTO_DELETE_NO}
        onChange={onChange}
      />
      <Row>
        <Radio
          checked={autoDelete === AUTO_DELETE_KEEP}
          name="auto_delete"
          title={_(
            'Automatically delete oldest reports but always keep newest',
          )}
          value="keep"
          onChange={onChange}
        />
        <Spinner
          disabled={autoDelete !== AUTO_DELETE_KEEP}
          grow="1"
          max="1200"
          min="2"
          name="auto_delete_data"
          type="int"
          value={autoDeleteData}
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
