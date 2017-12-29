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
import Promise from 'gmp/promise.js';
import {is_defined} from 'gmp/utils.js';

import {TARGET_CREDENTIAL_NAMES} from 'gmp/models/target.js';

import PropTypes from '../../utils/proptypes.js';
import withComponentDefaults from '../../utils/withComponentDefaults.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import ListIcon from '../../components/icon/listicon.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import EntityPage from '../../entity/page.js';
import EntityPermissions from '../../entity/permissions.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import TargetDetails from './details.js';
import TargetComponent from './component.js';

const ToolBarIcons = ({
  entity,
  onTargetCloneClick,
  onTargetCreateClick,
  onTargetDeleteClick,
  onTargetDownloadClick,
  onTargetEditClick,
}, {capabilities}) => {
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="creating-a-target"
          title={_('Help: Targets')}
        />
        <ListIcon
          title={_('Target List')}
          page="targets"
        />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          entity={entity}
          onClick={onTargetCreateClick}
        />
        <CloneIcon
          entity={entity}
          onClick={onTargetCloneClick}
        />
        <EditIcon
          entity={entity}
          onClick={onTargetEditClick}
        />
        <TrashIcon
          entity={entity}
          onClick={onTargetDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Target as XML')}
          onClick={onTargetDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onTargetCloneClick: PropTypes.func.isRequired,
  onTargetCreateClick: PropTypes.func.isRequired,
  onTargetDeleteClick: PropTypes.func.isRequired,
  onTargetDownloadClick: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  ...props
}) => (
  <Layout flex="column">
    <InfoTable>
      <TableBody>
        <TableRow>
          <TableData>
            {_('Name')}
          </TableData>
          <TableData>
            {entity.name}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>
            {_('Comment')}
          </TableData>
          <TableData>
            {entity.comment}
          </TableData>
        </TableRow>
      </TableBody>
    </InfoTable>

    <TargetDetails
      entity={entity}
      {...props}
    />
  </Layout>
);

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => {
  return (
    <TargetComponent
      onCloned={goto_details('target', props)}
      onCloneError={onError}
      onCreated={goto_details('target', props)}
      onDeleted={goto_list('targets', props)}
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
          detailsComponent={Details}
          permissionsComponent={TargetPermissions}
          sectionIcon="target.svg"
          toolBarIcons={ToolBarIcons}
          title={_('Target')}
          onTargetCloneClick={clone}
          onTargetCreateClick={create}
          onTargetDeleteClick={delete_func}
          onTargetDownloadClick={download}
          onTargetEditClick={edit}
          onTargetSaveClick={save}
          onPermissionChanged={onChanged}
          onPermissionDownloaded={onDownloaded}
          onPermissionDownloadError={onError}
        />
      )}
    </TargetComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const TargetPermissions = withComponentDefaults({
  relatedResourcesLoaders: [
    ({entity}) => {
      const resources = [];
      for (const name of ['port_list', ...TARGET_CREDENTIAL_NAMES]) {
        const cred = entity[name];
        if (is_defined(cred)) {
          resources.push(cred);
        }
      }
      return Promise.resolve(resources);
    },
  ],
})(EntityPermissions);

const TargetPage = props => (
  <EntityContainer
    {...props}
    name="target"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default TargetPage;

// vim: set ts=2 sw=2 tw=80:
