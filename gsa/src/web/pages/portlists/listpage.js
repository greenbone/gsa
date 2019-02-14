/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import {PORTLISTS_FILTER_FILTER} from 'gmp/models/filter';

import IconDivider from 'web/components/layout/icondivider';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import UploadIcon from 'web/components/icon/uploadicon';
import NewIcon from 'web/components/icon/newicon';
import PortListIcon from 'web/components/icon/portlisticon';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/portlists';

import PortListComponent from './component';
import PortListsFilterDialog from './filterdialog';
import PortListsTable from './table';

const ToolBarIcons = withCapabilities(
  ({capabilities, onPortListCreateClick, onPortListImportClick}) => (
    <IconDivider>
      <ManualIcon
        page="search"
        searchTerm="port list"
        title={_('Help: Port Lists')}
      />
      {capabilities.mayCreate('port_list') && (
        <NewIcon title={_('New Port List')} onClick={onPortListCreateClick} />
      )}
      <UploadIcon
        title={_('Import Port List')}
        onClick={onPortListImportClick}
      />
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onPortListCreateClick: PropTypes.func.isRequired,
  onPortListImportClick: PropTypes.func.isRequired,
};

const PortListsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
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
    onInteraction={onInteraction}
  >
    {({
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
        filtersFilter={PORTLISTS_FILTER_FILTER}
        sectionIcon={<PortListIcon size="large" />}
        table={PortListsTable}
        title={_('Portlists')}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onDownloaded={onDownloaded}
        onError={onError}
        onInteraction={onInteraction}
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
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('portlist', {
  entitiesSelector,
  loadEntities,
})(PortListsPage);

// vim: set ts=2 sw=2 tw=80:
