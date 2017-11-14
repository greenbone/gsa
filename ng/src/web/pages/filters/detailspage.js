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

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';

import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import ListIcon from '../../components/icon/listicon.js';

import FilterDetails from './details.js';
import FilterComponent from './component.js';

const ToolBarIcons = ({
  entity,
  onFilterCloneClick,
  onFilterCreateClick,
  onFilterDeleteClick,
  onFilterDownloadClick,
  onFilterEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <HelpIcon
        page="filter_details"
        title={_('Help: Filter Details')}
      />
      <ListIcon
        title={_('Filter List')}
        page="filters"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onFilterCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onFilterCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onFilterEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onFilterDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Filter as XML')}
        onClick={onFilterDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onFilterCloneClick: PropTypes.func.isRequired,
  onFilterCreateClick: PropTypes.func.isRequired,
  onFilterDeleteClick: PropTypes.func.isRequired,
  onFilterDownloadClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => {
  return (
    <FilterComponent
      onCloned={goto_details('filter', props)}
      onCloneError={onError}
      onCreated={goto_details('filter', props)}
      onDeleted={goto_list('filters', props)}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        edit,
        save,
      }) => (
        <EntityPage
          {...props}
          detailsComponent={FilterDetails}
          sectionIcon="filter.svg"
          toolBarIcons={ToolBarIcons}
          title={_('Filter')}
          onFilterCloneClick={clone}
          onFilterCreateClick={create}
          onFilterDeleteClick={delete_func}
          onFilterDownloadClick={download}
          onFilterEditClick={edit}
          onFilterSaveClick={save}
          onPermissionChanged={onChanged}
          onPermissionDownloaded={onDownloaded}
          onPermissionDownloadError={onError}
        />
      )}
    </FilterComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const FilterPage = props => (
  <EntityContainer
    {...props}
    name="filter"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default FilterPage;

// vim: set ts=2 sw=2 tw=80:
