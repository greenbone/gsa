/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import NewIcon from 'web/components/icon/newicon';

import IconMenu from 'web/components/menu/iconmenu';
import MenuEntry from 'web/components/menu/menuentry';

import PropTypes from 'web/utils/proptypes';
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

// vim: set ts=2 sw=2 tw=80:
