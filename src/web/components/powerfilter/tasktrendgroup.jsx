/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


/* eslint-disable react/prop-types */
import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

const TaskTrendGroup = ({trend, name = 'trend', filter, onChange}) => {
  if (!isDefined(trend) && isDefined(filter)) {
    trend = filter.get('trend');
  }
  return (
    <FormGroup title={_('Trend')}>
      <Select
        name={name}
        value={trend}
        onChange={onChange}
        items={[
          {label: _('Severity increased'), value: 'up', 'data-testid': 'trend_up'},
          {label: _('Severity decreased'), value: 'down', 'data-testid': 'trend_down'},
          {label: _('Vulnerability count increased'), value: 'more', 'data-testid': 'trend_more'},
          {label: _('Vulnerability count decreased'), value: 'less', 'data-testid': 'trend_less'},
          {label: _('Vulnerabilities did not change'), value: 'same', 'data-testid': 'trend_same'},
        ]}
      />
    </FormGroup>
  );
};

TaskTrendGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  name: PropTypes.string,
  trend: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default TaskTrendGroup;
