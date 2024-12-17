/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {useSelector} from 'react-redux';
import ResumeIcon from 'web/components/icon/resumeicon';
import StartIcon from 'web/components/icon/starticon';
import useTranslation from 'web/hooks/useTranslation';
import TaskResumeIconBase from 'web/pages/tasks/icons/resumeicon';
import TaskStartIconBase from 'web/pages/tasks/icons/starticon';
import PropTypes from 'web/utils/proptypes';

const TaskIconWithSync = ({type, ...props}) => {
  const [_] = useTranslation();

  const feedSyncingStatus = useSelector(state => state.feedStatus);

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

TaskIconWithSync.propTypes = {
  type: PropTypes.string.isRequired,
};

export default TaskIconWithSync;
