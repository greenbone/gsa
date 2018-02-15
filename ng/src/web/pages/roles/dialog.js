/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined, map} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import {permission_description} from '../../utils/render.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import Button from '../../components/form/button.js';
import FormGroup from '../../components/form/formgroup.js';
import MultiSelect from '../../components/form/multiselect.js';
import Select from '../../components/form/select.js';
import TextField from '../../components/form/textfield.js';

import TrashIcon from '../../components/icon/trashicon.js';

import Layout from '../../components/layout/layout.js';

import Table from '../../components/table/table.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

const DEFAULTS = {name: _('Unnamed')};

const Dialog = ({
    all_groups,
    all_permissions,
    all_users,
    group_id,
    permissions,
    permission_name,
    role,
    title = _('New Role'),
    visible,
    onClose,
    onCreatePermission,
    onCreateSuperPermission,
    onDeletePermission,
    onSave,
  }) => {

  const is_edit = is_defined(role);
  const has_groups = is_defined(all_groups) && all_groups.length > 0;
  const has_permissions = is_defined(all_permissions) &&
    all_permissions.length > 0;

  const groupOptions = map(all_groups, group => ({
    label: group.name,
    value: group.id,
  }));

  const permissionsOptions = map(all_permissions, permission => {
    const labelString = permission.name + ' (' +
      permission_description(permission.name) + ')';
    return {
      label: labelString,
      value: permission.name,
    };
  });

  const usersOptions = map(all_users, user => ({
    label: user.name,
    value: user.name,
  }));

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      initialData={{...DEFAULTS, ...role}}
    >
      {({
        data: state,
        onValueChange,
      }) => {

        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
                maxLength="80"/>
            </FormGroup>

            <FormGroup
              title={_('Comment')}
              flex="column">
              <TextField
                name="comment"
                value={state.comment}
                size="30"
                maxLength="400"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup
              title={_('Users')}>
              <MultiSelect
                name="users"
                items={usersOptions}
                value={state.users}
                onChange={onValueChange}
              />
            </FormGroup>

            {is_edit &&
              <Layout flex="column">
                <h2>{_('New Permission')}</h2>

                <FormGroup
                  title={_('Name')}
                  flex align={['space-between', 'center']}>
                  <Select
                    name="permission_name"
                    items={permissionsOptions}
                    value={state.permission_name}
                    onChange={onValueChange}
                  />
                  <Button
                    title={_('Create Permission')}
                    disabled={state.in_use || !has_permissions}
                    value={{role_id: state.id, name: state.permission_name}}
                    onClick={onCreatePermission}
                  />
                </FormGroup>

                <h2>{_('New Super Permission')}</h2>

                <FormGroup
                  title={_('Group')}
                  flex align={['space-between', 'center']}>
                  <Select
                    name="group_id"
                    items={groupOptions}
                    value={state.group_id}
                    onChange={onValueChange}
                  />
                  <Button
                    title={_('Create Permission')}
                    disabled={!has_groups}
                    value={{role_id: state.id, group_id: state.group_id}}
                    onClick={onCreateSuperPermission}
                  />
                </FormGroup>

                <h2>{_('General Command Permissions')}</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {_('Name')}
                      </TableHead>
                      <TableHead>
                        {_('Description')}
                      </TableHead>
                      <TableHead width="2em">
                        {_('Actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {
                      map(permissions, permission => {
                        return (
                          <TableRow key={permission.id}>
                            <TableData>
                              {permission.name}
                            </TableData>
                            <TableData>
                              {
                                permission_description(permission.name,
                                  permission.resource)
                              }
                            </TableData>
                            <TableData flex align="center">
                              {!permission.isInUse() &&
                                <TrashIcon
                                  title={_('Move permission to trashcan')}
                                  value={{
                                    role_id: state.id,
                                    permission_id: permission.id,
                                  }}
                                  onClick={onDeletePermission}
                                />
                              }
                            </TableData>
                          </TableRow>
                        );
                      })
                    }
                  </TableBody>
                </Table>
              </Layout>
            }
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

Dialog.propTypes = {
  all_groups: PropTypes.array,
  all_permissions: PropTypes.array,
  all_users: PropTypes.array,
  group_id: PropTypes.id,
  permission_name: PropTypes.string,
  permissions: PropTypes.array,
  role: PropTypes.model,
  title: PropTypes.string,
  users: PropTypes.array,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreatePermission: PropTypes.func.isRequired,
  onCreateSuperPermission: PropTypes.func.isRequired,
  onDeletePermission: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};


export default Dialog;

// vim: set ts=2 sw=2 tw=80:
