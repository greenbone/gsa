/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
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
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHeader from 'web/components/table/Header';
import Table from 'web/components/table/Table';
import TableHead from 'web/components/table/TableHead';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {permissionDescription} from 'web/utils/Render';

const Dialog = ({
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
}) => {
  const [_] = useTranslation();
  title = title || _('New Role');
  const DEFAULTS = {name: _('Unnamed')};

  const isEdit = isDefined(role);
  const hasGroups = allGroups.length > 0;
  const hasPermissions = allPermissions.length > 0;

  const groupOptions = allGroups.map(group => ({
    label: group.name,
    value: group.id,
  }));

  const permissionsOptions = allPermissions.map(permission => {
    const labelString =
      permission + ' (' + permissionDescription(permission) + ')';
    return {
      label: labelString,
      value: permission,
    };
  });

  const usersOptions = allUsers.map(user => ({
    label: user.name,
    value: user.name,
  }));

  const defaultValues = {
    ...DEFAULTS,
    ...role,
  };

  return (
    <SaveDialog
      defaultValues={defaultValues}
      error={error}
      title={title}
      onClose={onClose}
      onErrorClose={onErrorClose}
      onSave={onSave}
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

            <FormGroup flex="column" title={_('Comment')}>
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
                        roleId: state.id,
                        name: state.permissionName,
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
                        roleId: state.id,
                        groupId: state.groupId,
                      })
                    }
                  />
                </FormGroup>

                <h2>{_('General Command Permissions')}</h2>
                {isLoadingPermissions && permissions.length === 0 ? (
                  <Loading />
                ) : (
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
                              permission.resource,
                            )}
                          </TableData>
                          <TableData align={['center', 'center']}>
                            {!permission.isInUse() && (
                              <TrashcanIcon
                                title={_('Move permission to trashcan')}
                                value={{
                                  roleId: state.id,
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
                )}
              </Layout>
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

Dialog.propTypes = {
  allGroups: PropTypes.arrayOf(PropTypes.model),
  allPermissions: PropTypes.arrayOf(PropTypes.string),
  allUsers: PropTypes.arrayOf(PropTypes.model),
  error: PropTypes.string,
  isCreatingPermission: PropTypes.bool,
  isCreatingSuperPermission: PropTypes.bool,
  isInUse: PropTypes.bool,
  isLoadingPermissions: PropTypes.bool,
  permissionName: PropTypes.string,
  permissions: PropTypes.array,
  role: PropTypes.model,
  title: PropTypes.string,
  users: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onCreatePermission: PropTypes.func.isRequired,
  onCreateSuperPermission: PropTypes.func.isRequired,
  onDeletePermission: PropTypes.func.isRequired,
  onErrorClose: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default Dialog;
