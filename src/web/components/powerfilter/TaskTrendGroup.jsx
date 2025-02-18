/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const TaskTrendGroup = ({trend, name = 'trend', filter, onChange}) => {
  const [_] = useTranslation();
  if (!isDefined(trend) && isDefined(filter)) {
    trend = filter.get('trend');
  }
  return (
    <FormGroup title={_('Trend')}>
      <Select
        data-testid="filter-trend"
        items={[
          {label: _('Severity increased'), value: 'up'},
          {label: _('Severity decreased'), value: 'down'},
          {label: _('Vulnerability count increased'), value: 'more'},
          {label: _('Vulnerability count decreased'), value: 'less'},
          {label: _('Vulnerabilities did not change'), value: 'same'},
        ]}
        name={name}
        value={trend}
        onChange={onChange}
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
