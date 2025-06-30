/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {map} from 'gmp/utils/array';
import ExportIcon from 'web/components/icon/ExportIcon';
import HorizontalSeparator from 'web/components/layout/HorizontalSep';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import useTranslation from 'web/hooks/useTranslation';
import {convert_auth_method, convert_allow} from 'web/pages/users/Details';
import PropTypes from 'web/utils/PropTypes';

const Actions = withEntitiesActions(
  ({
    entity,
    onUserCloneClick,
    onUserEditClick,
    onUserDeleteClick,
    onUserDownloadClick,
  }) => {
    const [_] = useTranslation();

    return (
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
    );
  },
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
  const [_] = useTranslation();
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

  const authMethod = convert_auth_method(entity.authMethod, _);
  const host_allow = convert_allow(entity.hosts, _).replace(/&#x2F;/g, '/');
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
