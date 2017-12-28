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

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Section from '../../components/section/section.js';
import {FoldState} from '../../components/folding/folding.js';

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import PortListComponent from './component.js';
import PortListDetails from './details.js';
import PortRangesTable from './portrangestable.js';

const ToolBarIcons = ({
  entity,
  onPortListCloneClick,
  onPortListCreateClick,
  onPortListDeleteClick,
  onPortListDownloadClick,
  onPortListEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="search"
        searchTerm="port list"
        title={_('Help: PortList Details')}
      />
      <ListIcon
        title={_('PortList List')}
        page="portlists"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onPortListCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onPortListCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onPortListEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onPortListDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export PortList as XML')}
        onClick={onPortListDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onPortListCloneClick: PropTypes.func.isRequired,
  onPortListCreateClick: PropTypes.func.isRequired,
  onPortListDeleteClick: PropTypes.func.isRequired,
  onPortListDownloadClick: PropTypes.func.isRequired,
  onPortListEditClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  links = true,
  ...props
}) => {
  const {
    port_ranges = [],
  } = entity;
  return (
    <Layout flex="column">
      <PortListDetails
        entity={entity}
        links={links}
      />

      <Section
        title={_('Port Ranges ({{count}})', {count: port_ranges.length})}
        foldable
        initialFoldState={FoldState.FOLDED}
      >
        <PortRangesTable
          actions={false}
          portRanges={port_ranges}
        />
      </Section>
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const Page = ({
  onError,
  onChanged,
  onDownloaded,
  ...props
}) => (
  <PortListComponent
    onCloned={goto_details('portlist', props)}
    onCloneError={onError}
    onCreated={goto_details('portlist', props)}
    onDeleted={goto_list('portlists', props)}
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
        sectionIcon="port_list.svg"
        title={_('Port List')}
        detailsComponent={Details}
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
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      />
    )}
  </PortListComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const PortListPage = props => (
  <EntityContainer
    {...props}
    name="portlist"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default PortListPage;
