/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';

import PropTypes from 'web/utils/proptypes';
import {permissionDescription} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import Button from 'web/components/form/button';
import FormGroup from 'web/components/form/formgroup';
import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import TrashIcon from 'web/components/icon/trashicon';

import Layout from 'web/components/layout/layout';

import Table from 'web/components/table/table';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

const Dialog = ({
  allGroups,
  allPermissions,
  allUsers,
  error,
  groupId,
  isInUse = false,
  permissions,
  permissionName,
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
  const hasGroups = isDefined(allGroups) && allGroups.length > 0;
  const hasPermissions = isDefined(allPermissions) && allPermissions.length > 0;

  const groupOptions = map(allGroups, group => ({
    label: group.name,
    value: group.id,
  }));

  const permissionsOptions = map(allPermissions, permission => {
    const labelString =
      permission.name + ' (' + permissionDescription(permission.name) + ')';
    return {
      label: labelString,
      value: permission.name,
    };
  });

  const usersOptions = map(allUsers, user => ({
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
                  <Button
                    title={_('Create Permission')}
                    disabled={isInUse || !hasPermissions}
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
                  <Button
                    title={_('Create Permission')}
                    disabled={!hasGroups}
                    value={{roleId: state.id, groupId: state.groupId}}
                    onClick={onCreateSuperPermission}
                  />
                </FormGroup>

                <h2>{_('General Command Permissions')}</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{_('Name')}</TableHead>
                      <TableHead>{_('Description')}</TableHead>
                      <TableHead width="2em">{_('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {map(permissions, permission => {
                      return (
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
                      );
                    })}
                  </TableBody>
                </Table>
              </Layout>
            )}
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

Dialog.propTypes = {
  allGroups: PropTypes.array,
  allPermissions: PropTypes.array,
  allUsers: PropTypes.array,
  error: PropTypes.string,
  groupId: PropTypes.id,
  isInUse: PropTypes.bool,
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
