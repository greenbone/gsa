/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {TaskTrend} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';

interface TaskTrendGroupProps {
  trend?: TaskTrend;
  name?: string;
  filter?: Filter;
  onChange?: (value: TaskTrend, name: string) => void;
}

const TaskTrendGroup = ({
  trend,
  name = 'trend',
  filter,
  onChange,
}: TaskTrendGroupProps) => {
  const [_] = useTranslation();
  if (!isDefined(trend) && isDefined(filter)) {
    trend = filter.get('trend') as TaskTrend;
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
        onChange={
          onChange as ((value: string, name?: string) => void) | undefined
        }
      />
    </FormGroup>
  );
};

export default TaskTrendGroup;
