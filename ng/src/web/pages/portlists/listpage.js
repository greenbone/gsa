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

import IconDivider from '../../components/layout/icondivider.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import NewIcon from '../../components/icon/newicon.js';

import {PORTLISTS_FILTER_FILTER} from 'gmp/models/filter.js';

import PortListComponent from './component.js';
import PortListsFilterDialog from './filterdialog.js';
import PortListsTable from './table.js';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onPortListCreateClick,
  onPortListImportClick,
}) => (
  <IconDivider>
    <ManualIcon
      page="search"
      searchTerm="port list"
      title={_('Help: Port Lists')}/>
    {capabilities.mayCreate('port_list') &&
      <NewIcon
        title={_('New Port List')}
        onClick={onPortListCreateClick}/>
    }
    <Icon
      img="upload.svg"
      title={_('Import Port List')}
      onClick={onPortListImportClick}/>
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onPortListCreateClick: PropTypes.func.isRequired,
  onPortListImportClick: PropTypes.func.isRequired,
};

const PortListsPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <PortListComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onImported={onChanged}
    onImportError={onError}
  >{({
    clone,
    create,
    delete: delete_func,
    download,
    edit,
    save,
    import: import_func,
  }) => (
    <EntitiesPage
      {...props}
      filterEditDialog={PortListsFilterDialog}
      sectionIcon="port_list.svg"
      table={PortListsTable}
      title={_('Portlists')}
      toolBarIcons={ToolBarIcons}
      onChanged={onChanged}
      onDownloaded={onDownloaded}
      onError={onError}
      onPortListCloneClick={clone}
      onPortListCreateClick={create}
      onPortListDeleteClick={delete_func}
      onPortListDownloadClick={download}
      onPortListEditClick={edit}
      onPortListSaveClick={save}
      onPortListImportClick={import_func}
    />
  )}
  </PortListComponent>
);

PortListsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('portlist', {
  filtersFilter: PORTLISTS_FILTER_FILTER,
})(PortListsPage);

// vim: set ts=2 sw=2 tw=80:
