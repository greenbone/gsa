/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Role from 'gmp/models/role';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

interface RoleDetailsPageToolBarIconsProps {
  entity: Role;
  onRoleCloneClick?: (entity: Role) => void;
  onRoleCreateClick?: () => void;
  onRoleDeleteClick?: (entity: Role) => void;
  onRoleDownloadClick?: (entity: Role) => void;
  onRoleEditClick?: (entity: Role) => void;
}

const RoleDetailsPageToolBarIcons = ({
  entity,
  onRoleCloneClick,
  onRoleCreateClick,
  onRoleDeleteClick,
  onRoleDownloadClick,
  onRoleEditClick,
}: RoleDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-roles"
          page="web-interface-access"
          title={_('Help: Roles')}
        />
        <ListIcon page="roles" title={_('Roles List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onRoleCreateClick} />
        <CloneIcon entity={entity} onClick={onRoleCloneClick} />
        <EditIcon entity={entity} onClick={onRoleEditClick} />
        <TrashIcon entity={entity} onClick={onRoleDeleteClick} />
        <ExportIcon
          title={_('Export Role as XML')}
          value={entity}
          onClick={onRoleDownloadClick as (entity?: Role) => void}
        />
      </IconDivider>
    </Divider>
  );
};

export default RoleDetailsPageToolBarIcons;
