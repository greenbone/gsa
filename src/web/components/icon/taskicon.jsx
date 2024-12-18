/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/task.svg';
import withSvgIcon from './withSvgIcon';

const TaskIconComponent = withSvgIcon()(Icon);

const TaskIcon = props => (
  <TaskIconComponent {...props} data-testid="task-icon" />
);

export default TaskIcon;
