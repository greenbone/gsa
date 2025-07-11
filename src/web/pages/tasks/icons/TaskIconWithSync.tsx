/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector} from 'react-redux';
import Task from 'gmp/models/task';
import {ResumeIcon, StartIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import TaskResumeIconBase from 'web/pages/tasks/icons/TaskResumeIcon';
import TaskStartIconBase from 'web/pages/tasks/icons/TaskStartIcon';

interface TaskIconWithSyncProps {
  type: 'start' | 'resume';
  task: Task;
  onClick?: (task: Task) => void | Promise<void>;
}

const TaskIconWithSync = ({type, ...props}: TaskIconWithSyncProps) => {
  const [_] = useTranslation();

  const feedSyncingStatus = useSelector<
    {feedStatus: {isSyncing: boolean}},
    {isSyncing: boolean}
  >(state => state.feedStatus);

  if (feedSyncingStatus.isSyncing) {
    const SyncingIcon = type === 'start' ? StartIcon : ResumeIcon;
    return (
      <SyncingIcon
        active={false}
        title={_('Feed is currently syncing. Please try again later.')}
      />
    );
  }

  const BaseIcon = type === 'start' ? TaskStartIconBase : TaskResumeIconBase;
  return <BaseIcon {...props} />;
};

export default TaskIconWithSync;
