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

import {isDefined} from 'gmp/utils/identity';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import LoadingButton from 'web/components/form/loadingbutton';
import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import TrashIcon from 'web/components/icon/trashicon';

import Loading from 'web/components/loading/loading';

import Layout from 'web/components/layout/layout';

import Table from 'web/components/table/table';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import PropTypes from 'web/utils/proptypes';
import {permissionDescription} from 'web/utils/render';

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
  title = _('New Role'),
  onClose,
  onCreatePermission,
  onCreateSuperPermission,
  onDeletePermission,
  onErrorClose,
  onSave,
}) => {
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
      initialHeight={isEdit ? '600px' : undefined}
      title={title}
      onClose={onClose}
      onErrorClose={onErrorClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')} flex="column">
              <TextField
                name="comment"
                value={state.comment}
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Users')}>
              <MultiSelect
                name="users"
                items={usersOptions}
                value={state.users}
                onChange={onValueChange}
              />
            </FormGroup>

            {isEdit && (
              <Layout flex="column">
                <h2>{_('New Permission')}</h2>

                <FormGroup
                  title={_('Name')}
                  align={['space-between', 'center']}
                >
                  <Select
                    name="permissionName"
                    items={permissionsOptions}
                    value={state.permissionName}
                    onChange={onValueChange}
                  />
                  <LoadingButton
                    title={_('Create Permission')}
                    disabled={
                      isInUse ||
                      !hasPermissions ||
                      !isDefined(state.permissionName)
                    }
                    isLoading={isCreatingPermission}
                    value={{roleId: state.id, name: state.permissionName}}
                    onClick={onCreatePermission}
                  />
                </FormGroup>

                <h2>{_('New Super Permission')}</h2>

                <FormGroup
                  title={_('Group')}
                  align={['space-between', 'center']}
                >
                  <Select
                    name="groupId"
                    items={groupOptions}
                    value={state.groupId}
                    onChange={onValueChange}
                  />
                  <LoadingButton
                    title={_('Create Permission')}
                    disabled={!hasGroups || !isDefined(state.groupId)}
                    isLoading={isCreatingSuperPermission}
                    value={{roleId: state.id, groupId: state.groupId}}
                    onClick={onCreateSuperPermission}
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
                              <TrashIcon
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
          </Layout>
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

// vim: set ts=2 sw=2 tw=80:
