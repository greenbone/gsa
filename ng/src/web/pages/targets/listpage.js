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

import ManualIcon from '../../components/icon/manualicon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import TargetsFilterDialog from './filterdialog.js';
import TargetsTable from './table.js';
import TargetComponent from './component.js';

import {TARGETS_FILTER_FILTER} from 'gmp/models/filter.js';

const ToolBarIcons = ({onTargetCreateClick}) => {
  return (
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="creating-a-target"
        title={_('Help: Targets')}
      />
      <NewIcon
        title={_('New Target')}
        onClick={onTargetCreateClick}/>
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onTargetCreateClick: PropTypes.func.isRequired,
};

const TargetsPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <TargetComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
  >{({
    clone,
    create,
    delete: delete_func,
    download,
    edit,
    save,
  }) => (
    <EntitiesPage
      {...props}
      filterEditDialog={TargetsFilterDialog}
      sectionIcon="target.svg"
      table={TargetsTable}
      title={_('Targets')}
      toolBarIcons={ToolBarIcons}
      onChanged={onChanged}
      onDownloaded={onDownloaded}
      onError={onError}
      onTargetCloneClick={clone}
      onTargetCreateClick={create}
      onTargetDeleteClick={delete_func}
      onTargetDownloadClick={download}
      onTargetEditClick={edit}
      onTargetSaveClick={save}
    />
  )}
  </TargetComponent>
);

TargetsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('target', {
  filtersFilter: TARGETS_FILTER_FILTER,
})(TargetsPage);

// vim: set ts=2 sw=2 tw=80:
