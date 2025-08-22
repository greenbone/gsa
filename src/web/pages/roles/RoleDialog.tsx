/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {GroupProperties} from 'gmp/models/group';
import Permission from 'gmp/models/permission';
import {UserProperties} from 'gmp/models/user';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Button from 'web/components/form/Button';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {TrashcanIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import Table from 'web/components/table/Table';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import {permissionDescription} from 'web/utils/Render';

interface CreatePermissionData {
  roleId: string;
  name: string;
}

interface CreateSuperPermissionData {
  roleId: string;
  groupId: string;
}

interface DeletePermissionData {
  roleId: string;
  permissionId: string;
}

interface RoleData {
  id?: string;
  name?: string;
  comment?: string;
  users?: Array<string>;
}

interface SaveRoleData {
  id?: string;
  name: string;
  comment: string;
  users: Array<string>;
}

interface RoleDialogValues {
  permissionName?: string;
  groupId?: string;
}

interface RoleDialogDefaultValues {
  id?: string;
  name: string;
  comment?: string;
  users?: Array<string>;
}

type ExtendedStateType = RoleDialogDefaultValues & RoleDialogValues;

interface RoleDialogProps {
  allGroups?: GroupProperties[];
  allPermissions?: Array<string>;
  allUsers?: UserProperties[];
  error?: string;
  isCreatingPermission?: boolean;
  isCreatingSuperPermission?: boolean;
  isInUse?: boolean;
  isLoadingPermissions?: boolean;
  permissions?: Permission[];
  role?: RoleData;
  title?: string;
  onClose: () => void;
  onCreatePermission: (data: CreatePermissionData) => void | Promise<void>;
  onCreateSuperPermission: (
    data: CreateSuperPermissionData,
  ) => void | Promise<void>;
  onDeletePermission: (data: DeletePermissionData) => void | Promise<void>;
  onErrorClose?: () => void;
  onSave: (data: SaveRoleData) => void | Promise<void>;
}

const RoleDialog = ({
  allGroups = [],
  allPermissions = [],
  allUsers = [],
  error,
  isCreatingPermission = false,
  isCreatingSuperPermission = false,
  isInUse = false,
  isLoadingPermissions = false,
  permissions = [],
  role,
  title,
  onClose,
  onCreatePermission,
  onCreateSuperPermission,
  onDeletePermission,
  onErrorClose,
  onSave,
}: RoleDialogProps) => {
  const [_] = useTranslation();
  title = title || _('New Role');
  const DEFAULTS = {name: _('Unnamed')};

  const isEdit = isDefined(role);
  const hasGroups = allGroups.length > 0;
  const hasPermissions = allPermissions.length > 0;

  const groupOptions = allGroups.map(group => ({
    label: group.name ?? '',
    value: group.id ?? '',
  }));

  const permissionsOptions = allPermissions.map(permission => {
    const labelString =
      permission +
      ' (' +
      permissionDescription(
        permission,
        {
          name: '',
          entityType: '',
        },
        undefined,
      ) +
      ')';
    return {
      label: labelString,
      value: permission,
    };
  });

  const usersOptions = allUsers.map(user => ({
    label: user.name ?? '',
    value: user.name ?? '',
  }));

  const defaultValues: RoleDialogDefaultValues = {
    ...DEFAULTS,
    ...role,
  };

  const values: RoleDialogValues = {};

  const handleSave = (state: ExtendedStateType) => {
    return onSave({
      id: state.id,
      name: state.name,
      comment: state.comment ?? '',
      users: state.users ?? [],
    });
  };

  const renderPermissionsContent = (state: ExtendedStateType) => {
    if (isLoadingPermissions && permissions.length === 0) {
      return <Loading />;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{_('Name')}</TableHead>
            <TableHead>{_('Description')}</TableHead>
            <TableHead width="2em">{_('Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map(permission => (
            <TableRow key={permission.id}>
              <TableData>{permission.name}</TableData>
              <TableData>
                {permissionDescription(
                  permission.name,
                  {name: permission.resource?.name ?? '', entityType: ''},
                  undefined,
                )}
              </TableData>
              <TableData align={['center', 'center']}>
                {!permission.isInUse() && permission.id && (
                  <TrashcanIcon
                    title={_('Move permission to trashcan')}
                    value={{
                      roleId: state.id ?? '',
                      permissionId: permission.id,
                    }}
                    onClick={onDeletePermission}
                  />
                )}
              </TableData>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <SaveDialog<RoleDialogValues, RoleDialogDefaultValues>
      defaultValues={defaultValues}
      error={error}
      title={title}
      values={values}
      onClose={onClose}
      onErrorClose={onErrorClose}
      onSave={handleSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Users')}>
              <MultiSelect
                items={usersOptions}
                name="users"
                value={state.users}
                onChange={onValueChange}
              />
            </FormGroup>

            {isEdit && (
              <Layout flex="column">
                <h2>{_('New Permission')}</h2>

                <FormGroup direction="row" title={_('Name')}>
                  <Select
                    grow="1"
                    items={permissionsOptions}
                    name="permissionName"
                    value={state.permissionName}
                    onChange={onValueChange}
                  />
                  <Button
                    disabled={
                      isInUse ||
                      !hasPermissions ||
                      !isDefined(state.permissionName)
                    }
                    isLoading={isCreatingPermission}
                    title={_('Create Permission')}
                    onClick={() =>
                      onCreatePermission({
                        roleId: state.id ?? '',
                        name: state.permissionName ?? '',
                      })
                    }
                  />
                </FormGroup>

                <h2>{_('New Super Permission')}</h2>

                <FormGroup direction="row" title={_('Group')}>
                  <Select
                    grow="1"
                    items={groupOptions}
                    name="groupId"
                    value={state.groupId}
                    onChange={onValueChange}
                  />
                  <Button
                    disabled={!hasGroups || !isDefined(state.groupId)}
                    isLoading={isCreatingSuperPermission}
                    title={_('Create Permission')}
                    onClick={() =>
                      onCreateSuperPermission({
                        roleId: state.id ?? '',
                        groupId: state.groupId ?? '',
                      })
                    }
                  />
                </FormGroup>

                <h2>{_('General Command Permissions')}</h2>
                {renderPermissionsContent(state)}
              </Layout>
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

export default RoleDialog;
