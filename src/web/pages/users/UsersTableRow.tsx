/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ComponentType} from 'react';
import type User from 'gmp/models/user';
import {map} from 'gmp/utils/array';
import ExportIcon from 'web/components/icon/ExportIcon';
import HorizontalSeparator from 'web/components/layout/HorizontalSep';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import {type RowComponentProps} from 'web/entities/EntitiesTable';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions, {
  type WithEntitiesActionsComponentProps,
} from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import useTranslation from 'web/hooks/useTranslation';
import {convertAllow, convertAuthMethod} from 'web/pages/users/UserDetails';

interface UsersRowActionHandlers {
  onUserCloneClick?: (user: User) => void | Promise<void>;
  onUserDeleteClick?: (user: User) => void | Promise<void>;
  onUserDownloadClick?: (user: User) => void | Promise<void>;
  onUserEditClick?: (user: User) => void | Promise<void>;
}

interface UsersActionsProps
  extends WithEntitiesActionsComponentProps<User>, UsersRowActionHandlers {}

interface UsersTableRowProps
  extends RowComponentProps<User>, UsersRowActionHandlers {
  actionsComponent?: ComponentType<UsersActionsProps>;
  links?: boolean;
}

const Actions = withEntitiesActions<User, UsersActionsProps>(
  ({
    entity,
    onUserCloneClick,
    onUserEditClick,
    onUserDeleteClick,
    onUserDownloadClick,
  }: UsersActionsProps) => {
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

const UsersTableRow = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}: UsersTableRowProps) => {
  const [_] = useTranslation();
  const roles = map(entity.roles, (role, index) =>
    role.id ? (
      <DetailsLink key={role.id} id={role.id} textOnly={!links} type="role">
        {role.name}
      </DetailsLink>
    ) : (
      <span key={`role-${index}`}>{role.name}</span>
    ),
  );

  const groups = map(entity.groups, (group, index) =>
    group.id ? (
      <DetailsLink key={group.id} id={group.id} textOnly={!links} type="group">
        {group.name}
      </DetailsLink>
    ) : (
      <span key={`group-${index}`}>{group.name}</span>
    ),
  );

  const authMethod = convertAuthMethod(entity.authMethod, _);
  const host_allow = convertAllow(entity.hosts ?? {addresses: []}, _).replace(
    /&#x2F;/g,
    '/',
  );
  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('User')}
        entity={entity}
        links={links}
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

export default UsersTableRow;
