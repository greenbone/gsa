/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NewIcon} from 'web/components/icon';
import IconMenu from 'web/components/menu/IconMenu';
import MenuEntry from 'web/components/menu/MenuEntry';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface NewIconMenuProps {
  onNewClick?: () => void;
  onNewContainerClick?: () => void;
}

const NewIconMenu = ({onNewClick, onNewContainerClick}: NewIconMenuProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  if (capabilities.mayCreate('task')) {
    return (
      <IconMenu icon={<NewIcon />}>
        <MenuEntry
          data-testid="new-task-menu"
          title={_('New Task')}
          onClick={onNewClick}
        />
        <MenuEntry
          data-testid="new-container-task-menu"
          title={_('New Container Task')}
          onClick={onNewContainerClick}
        />
      </IconMenu>
    );
  }
  return null;
};

export default NewIconMenu;
