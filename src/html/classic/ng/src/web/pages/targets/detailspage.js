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
import HelpIcon from '../../components/icon/helpicon.js';
import ListIcon from '../../components/icon/listicon.js';

import InfoTable from '../../components/table/info.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import EntityPage from '../../entity/page.js';
import EntityPermissions from '../../entity/permissions.js';
import {withEntityContainer} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/withEntityComponent.js';

import CloneIcon from '../../entities/icons/entitycloneicon.js';
import CreateIcon from '../../entities/icons/entitycreateicon.js';
import EditIcon from '../../entities/icons/entityediticon.js';
import TrashIcon from '../../entities/icons/entitytrashicon.js';

import TargetDetails from './details.js';
import withTargetComponent from './withTargetComponent.js';

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
        <HelpIcon
          page="target_details"
          title={_('Help: Target Details')}
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
  ...props,
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

const goto_target = goto_details('target');

const Page = withTargetComponent({
  onCloned: goto_target,
  onCloneError: 'onError',
  onCreated: goto_target,
  onCreateError: undefined,
  onDeleted: goto_list('targets'),
  onDeleteError: 'onError',
  onDownloadError: 'onError',
  onSaved: 'onChanged',
  onSaveError: undefined,
})(EntityPage);

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

export default withEntityContainer('target', {
  detailsComponent: Details,
  permissionsComponent: TargetPermissions,
  sectionIcon: 'target.svg',
  title: _('Target'),
  toolBarIcons: ToolBarIcons,
})(Page);

// vim: set ts=2 sw=2 tw=80:
