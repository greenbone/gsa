/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {map} from 'gmp/utils/array';
import React from 'react';
import ExportIcon from 'web/components/icon/exporticon';
import HorizontalSeparator from 'web/components/layout/horizontalsep';
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
        entity={entity}
        name="user"
        onClick={onUserDeleteClick}
      />
      <EditIcon
        displayName={_('User')}
        entity={entity}
        name="user"
        onClick={onUserEditClick}
      />
      <CloneIcon
        displayName={_('User')}
        entity={entity}
        mayClone={!entity.isSuperAdmin()}
        name="user"
        title={_('Clone User')}
        value={entity}
        onClick={onUserCloneClick}
      />
      <ExportIcon
        title={_('Export User')}
        value={entity}
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
    <DetailsLink key={role.id} id={role.id} textOnly={!links} type="role">
      {role.name}
    </DetailsLink>
  ));

  const groups = map(entity.groups, group => (
    <DetailsLink key={group.id} id={group.id} textOnly={!links} type="group">
      {group.name}
    </DetailsLink>
  ));

  const authMethod = convert_auth_method(entity.authMethod);
  const host_allow = convert_allow(entity.hosts).replace(/&#x2F;/g, '/');
  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('User')}
        entity={entity}
        link={links}
        type="user"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        <HorizontalSeparator $wrap>{roles}</HorizontalSeparator>
      </TableData>
      <TableData>
        <HorizontalSeparator $wrap>{groups}</HorizontalSeparator>
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
