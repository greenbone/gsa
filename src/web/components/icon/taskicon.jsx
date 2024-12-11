/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/task.svg';

const TaskIconComponent = withSvgIcon()(Icon);

const TaskIcon = props => (
  <TaskIconComponent {...props} data-testid="task-icon" />
);

export default TaskIcon;

// vim: set ts=2 sw=2 tw=80:
