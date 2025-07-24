/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {WizardIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import IconMenu from 'web/components/menu/IconMenu';
import MenuEntry from 'web/components/menu/MenuEntry';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import NewIconMenu from 'web/pages/tasks/icons/NewIconMenu';

interface TaskToolBarIconsProps {
  onAdvancedTaskWizardClick?: () => void;
  onModifyTaskWizardClick?: () => void;
  onContainerTaskCreateClick?: () => void;
  onTaskCreateClick?: () => void;
  onTaskWizardClick?: () => void;
}

const TaskToolBarIcons = ({
  onAdvancedTaskWizardClick,
  onModifyTaskWizardClick,
  onContainerTaskCreateClick,
  onTaskCreateClick,
  onTaskWizardClick,
}: TaskToolBarIconsProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const mayUseModifyTaskWizard =
    capabilities.mayEdit('task') &&
    (capabilities.mayCreate('alert') || capabilities.mayCreate('schedule'));
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-tasks"
        page="scanning"
        title={_('Help: Tasks')}
      />
      {capabilities.mayOp('run_wizard') && (
        <IconMenu icon={<WizardIcon />}>
          {capabilities.mayCreate('task') && (
            <MenuEntry
              data-testid="task-wizard-menu"
              title={_('Task Wizard')}
              onClick={onTaskWizardClick}
            />
          )}
          {capabilities.mayCreate('task') && (
            <MenuEntry
              data-testid="advanced-task-wizard-menu"
              title={_('Advanced Task Wizard')}
              onClick={onAdvancedTaskWizardClick}
            />
          )}
          {mayUseModifyTaskWizard && (
            <MenuEntry
              data-testid="modify-task-wizard-menu"
              title={_('Modify Task Wizard')}
              onClick={onModifyTaskWizardClick}
            />
          )}
        </IconMenu>
      )}

      <NewIconMenu
        onNewClick={onTaskCreateClick}
        onNewContainerClick={onContainerTaskCreateClick}
      />
    </IconDivider>
  );
};

export default TaskToolBarIcons;
