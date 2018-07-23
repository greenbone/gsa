/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import PropTypes from '../../../utils/proptypes.js';

import IconMenu from '../../../components/menu/iconmenu.js';
import MenuEntry from '../../../components/menu/menuentry.js';

const NewIcon = ({
  onNewClick,
  onNewContainerClick,
}, {capabilities}) => {
  if (capabilities.mayCreate('task')) {
    return (
      <IconMenu img="new.svg" onClick={onNewClick}>
        <MenuEntry
          title={_('New Task')}
          onClick={onNewClick}
        />
        <MenuEntry
          title={_('New Container Task')}
          onClick={onNewContainerClick}
        />
      </IconMenu>
    );
  }
  return null;
};

NewIcon.propTypes = {
  onNewClick: PropTypes.func,
  onNewContainerClick: PropTypes.func,
};

NewIcon.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default NewIcon;

// vim: set ts=2 sw=2 tw=80:
