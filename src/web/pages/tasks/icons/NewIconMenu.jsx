/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import { NewIcon } from 'web/components/icon/icons';
import IconMenu from 'web/components/menu/IconMenu';
import MenuEntry from 'web/components/menu/MenuEntry';
import useCapabilities from 'web/hooks/useCapabilities';
import PropTypes from 'web/utils/PropTypes';
const NewIconMenu = ({onNewClick, onNewContainerClick}) => {
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

NewIconMenu.propTypes = {
  onNewClick: PropTypes.func,
  onNewContainerClick: PropTypes.func,
};

export default NewIconMenu;
