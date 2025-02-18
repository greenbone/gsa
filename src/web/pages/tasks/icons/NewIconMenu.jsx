/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import NewIcon from 'web/components/icon/NewIcon';
import IconMenu from 'web/components/menu/IconMenu';
import MenuEntry from 'web/components/menu/MenuEntry';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';

const NewIconMenu = ({capabilities, onNewClick, onNewContainerClick}) => {
  if (capabilities.mayCreate('task')) {
    return (
      <IconMenu icon={<NewIcon />} onClick={onNewClick}>
        <MenuEntry title={_('New Task')} onClick={onNewClick} />
        <MenuEntry
          title={_('New Container Task')}
          onClick={onNewContainerClick}
        />
      </IconMenu>
    );
  }
  return null;
};

NewIconMenu.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  onNewClick: PropTypes.func,
  onNewContainerClick: PropTypes.func,
};

export default withCapabilities(NewIconMenu);
