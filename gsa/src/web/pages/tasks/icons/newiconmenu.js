/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import NewIcon from 'web/components/icon/newicon';

import IconMenu from 'web/components/menu/iconmenu';
import MenuEntry from 'web/components/menu/menuentry';

import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';

const NewIconMenu = ({onNewClick, onNewContainerClick}) => {
  const capabilities = useCapabilities();

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
  onNewClick: PropTypes.func,
  onNewContainerClick: PropTypes.func,
};

export default NewIconMenu;

// vim: set ts=2 sw=2 tw=80:
