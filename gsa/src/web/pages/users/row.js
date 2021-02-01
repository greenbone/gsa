/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {map} from 'gmp/utils/array';

import ExportIcon from 'web/components/icon/exporticon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import DeleteIcon from 'web/entity/icon/deleteicon';
import EditIcon from 'web/entity/icon/editicon';

import PropTypes from 'web/utils/proptypes';

import {convert_auth_method, convert_allow} from './details';

const Actions = withEntitiesActions(
  ({
    entity,
    onUserCloneClick,
    onUserEditClick,
    onUserDeleteClick,
    onUserDownloadClick,
  }) => (
    <IconDivider grow align="center">
      <DeleteIcon
        displayName={_('User')}
        name="user"
        entity={entity}
        onClick={onUserDeleteClick}
      />
      <EditIcon
        displayName={_('User')}
        name="user"
        entity={entity}
        onClick={onUserEditClick}
      />
      <CloneIcon
        displayName={_('User')}
        mayClone={!entity.isSuperAdmin()}
        name="user"
        entity={entity}
        title={_('Clone User')}
        value={entity}
        onClick={onUserCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export User')}
        onClick={onUserDownloadClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onUserCloneClick: PropTypes.func.isRequired,
  onUserDeleteClick: PropTypes.func.isRequired,
  onUserDownloadClick: PropTypes.func.isRequired,
  onUserEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const roles = map(entity.roles, role => (
    <DetailsLink textOnly={!links} key={role.id} type="role" id={role.id}>
      {role.name}
    </DetailsLink>
  ));

  const groups = map(entity.groups, group => (
    <DetailsLink textOnly={!links} type="group" key={group.id} id={group.id}>
      {group.name}
    </DetailsLink>
  ));

  const authMethod = convert_auth_method(entity.authMethod);
  const host_allow = convert_allow(entity.hosts).replace(/&#x2F;/g, '/');
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="user"
        displayName={_('User')}
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        <Divider>{roles}</Divider>
      </TableData>
      <TableData>
        <Divider>{groups}</Divider>
      </TableData>
      <TableData>{host_allow}</TableData>
      <TableData>{authMethod}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
