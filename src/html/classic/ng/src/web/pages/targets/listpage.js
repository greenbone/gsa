/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import HelpIcon from '../../components/icon/helpicon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import TargetsFilterDialog from './filterdialog.js';
import TargetsTable from './table.js';
import withTargetComponent from './withTargetComponent.js';

import {TARGETS_FILTER_FILTER} from 'gmp/models/filter.js';

const ToolBarIcons = ({onTargetCreateClick}) => {
  return (
    <IconDivider>
      <HelpIcon page="targets"/>
      <NewIcon
        title={_('New Target')}
        onClick={onTargetCreateClick}/>
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onTargetCreateClick: PropTypes.func.isRequired,
};

const TargetsPageNew = withTargetComponent({
  onCreated: 'onChanged',
  onSaved: 'onChanged',
  onCloned: 'onChanged',
  onDeleted: 'onChanged',
})(EntitiesPage);

export default withEntitiesContainer('target', {
  filterEditDialog: TargetsFilterDialog,
  filtersFilter: TARGETS_FILTER_FILTER,
  sectionIcon: 'target.svg',
  table: TargetsTable,
  title: _('Targets'),
  toolBarIcons: ToolBarIcons,
})(TargetsPageNew);

// vim: set ts=2 sw=2 tw=80:
