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
import EntitiesActions from 'web/entities/EntitiesActions';
import {type RowComponentProps} from 'web/entities/EntitiesTable';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import CloneIcon from 'web/entity/icon/CloneIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import useTranslation from 'web/hooks/useTranslation';
import {convertAllow, convertAuthMethod} from 'web/pages/users/UserDetails';
import {type SelectionTypeType} from 'web/utils/SelectionType';

interface UsersRowActionHandlers {
  onUserCloneClick?: (user: User) => void | Promise<void>;
  onUserDeleteClick?: (user: User) => void | Promise<void>;
  onUserDownloadClick?: (user: User) => void | Promise<void>;
  onUserEditClick?: (user: User) => void | Promise<void>;
}

interface UsersActionsProps extends UsersRowActionHandlers {
  entity: User;
  onEntityDeselected?: (entity: User) => void;
  onEntitySelected?: (entity: User) => void;
  selectionType?: SelectionTypeType;
}

interface UsersTableRowProps
  extends RowComponentProps<User>, UsersRowActionHandlers {
  actionsComponent?: ComponentType<UsersActionsProps>;
  links?: boolean;
  onEntityDeselected?: (entity: User) => void;
  onEntitySelected?: (entity: User) => void;
  selectionType?: SelectionTypeType;
}

const Actions = ({
  entity,
  onEntityDeselected,
  onEntitySelected,
  selectionType,
  onUserCloneClick,
  onUserEditClick,
  onUserDeleteClick,
  onUserDownloadClick,
}: UsersActionsProps) => {
  const [_] = useTranslation();

  return (
    <EntitiesActions
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
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
    </EntitiesActions>
  );
};

const UsersTableRow = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onEntityDeselected,
  onEntitySelected,
  onToggleDetailsClick,
  onUserCloneClick,
  onUserDeleteClick,
  onUserDownloadClick,
  onUserEditClick,
  selectionType,
}: UsersTableRowProps) => {
  const [_] = useTranslation();
  const roles = map(entity.roles, role =>
    role.id ? (
      <DetailsLink key={role.id} id={role.id} textOnly={!links} type="role">
        {role.name}
      </DetailsLink>
    ) : (
      <span key={role.name}>{role.name}</span>
    ),
  );

  const groups = map(entity.groups, group =>
    group.id ? (
      <DetailsLink key={group.id} id={group.id} textOnly={!links} type="group">
        {group.name}
      </DetailsLink>
    ) : (
      <span key={group.name}>{group.name}</span>
    ),
  );

  const authMethod = convertAuthMethod(entity.authMethod, _);
  const hostAllow = convertAllow(entity.hosts ?? {addresses: []}, _).replaceAll(
    '&#x2F;',
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
      <TableData>{hostAllow}</TableData>
      <TableData>{authMethod}</TableData>
      <ActionsComponent
        entity={entity}
        selectionType={selectionType}
        onEntityDeselected={onEntityDeselected}
        onEntitySelected={onEntitySelected}
        onUserCloneClick={onUserCloneClick}
        onUserDeleteClick={onUserDeleteClick}
        onUserDownloadClick={onUserDownloadClick}
        onUserEditClick={onUserEditClick}
      />
    </TableRow>
  );
};

export default UsersTableRow;
