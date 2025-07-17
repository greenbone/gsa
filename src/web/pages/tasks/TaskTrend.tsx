/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TaskTrend as TaskTrendType} from 'gmp/models/task';
import {
  TrendDownIcon,
  TrendLessIcon,
  TrendMoreIcon,
  TrendUpIcon,
  TrendNoChangeIcon,
} from 'web/components/icon';
import {ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useTranslation from 'web/hooks/useTranslation';

interface TaskTrendProps {
  name: TaskTrendType;
}

const TaskTrend = ({name}: TaskTrendProps) => {
  const [_] = useTranslation();
  let title: string | undefined;
  let IconComponent: React.ComponentType<ExtendedDynamicIconProps>;

  if (name === 'up') {
    title = _('Severity increased');
    IconComponent = TrendUpIcon;
  } else if (name === 'down') {
    title = _('Severity decreased');
    IconComponent = TrendDownIcon;
  } else if (name === 'more') {
    title = _('Vulnerability count increased');
    IconComponent = TrendMoreIcon;
  } else if (name === 'less') {
    title = _('Vulnerability count decreased');
    IconComponent = TrendLessIcon;
  } else if (name === 'same') {
    title = _('Vulnerabilities did not change');
    IconComponent = TrendNoChangeIcon;
  } else {
    return <span />;
  }

  return <IconComponent data-testid="trend-icon" size="small" title={title} />;
};

export default TaskTrend;
