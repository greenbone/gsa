/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NewIcon} from 'web/components/icon';
import IconMenu from 'web/components/menu/IconMenu';
import MenuEntry from 'web/components/menu/MenuEntry';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useTranslation from 'web/hooks/useTranslation';

interface NewIconMenuProps {
  onNewClick?: () => void;
  onNewImportTaskClick?: () => void;
  onNewAgentTaskClick?: () => void;
  onNewContainerImageTaskClick?: () => void;
  onNewWebApplicationTaskClick?: () => void;
}

const NewIconMenu = ({
  onNewClick,
  onNewImportTaskClick,
  onNewAgentTaskClick,
  onNewContainerImageTaskClick,
  onNewWebApplicationTaskClick,
}: NewIconMenuProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const features = useFeatures();
  if (capabilities.mayCreate('task')) {
    return (
      <IconMenu icon={<NewIcon />} title={_('New Task Menu')}>
        <MenuEntry
          data-testid="new-task-menu"
          title={_('New Task')}
          onClick={onNewClick}
        />
        <MenuEntry
          data-testid="new-import-task-menu"
          title={_('New Import Task')}
          onClick={onNewImportTaskClick}
        />
        {features.featureEnabled('ENABLE_AGENTS') && (
          <MenuEntry
            data-testid="new-agent-task-menu"
            title={_('New Agent Task')}
            onClick={onNewAgentTaskClick}
          />
        )}
        {features.featureEnabled('ENABLE_CONTAINER_SCANNING') && (
          <MenuEntry
            data-testid="new-container-image-menu"
            title={_('New Container Image Task')}
            onClick={onNewContainerImageTaskClick}
          />
        )}
        {features.featureEnabled('ENABLE_WEB_APPLICATION_SCANNING') && (
          <MenuEntry
            data-testid="new-web-application-menu"
            title={_('New Web Application Task')}
            onClick={onNewWebApplicationTaskClick}
          />
        )}
      </IconMenu>
    );
  }
  return null;
};

export default NewIconMenu;
