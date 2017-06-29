/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import  _ from '../../locale.js';
import {is_defined, map} from '../../utils.js';

import PropTypes from '../utils/proptypes.js';
import {permission_description} from '../utils/render.js';

import {withDialog} from '../components/dialog/dialog.js';

import Button from '../components/form/button.js';
import FormGroup from '../components/form/formgroup.js';
import Select2 from '../components/form/select2.js';
import TextField from '../components/form/textfield.js';

import TrashIcon from '../components/icon/trashicon.js';

import Layout from '../components/layout/layout.js';

import Table from '../components/table/table.js';
import TableBody from '../components/table/body.js';
import TableData from '../components/table/data.js';
import TableHeader from '../components/table/header.js';
import TableHead from '../components/table/head.js';
import TableRow from '../components/table/row.js';

const Dialog = ({
    all_groups,
    all_permissions,
    all_users,
    comment,
    group_id,
    id,
    in_use,
    name,
    users,
    permissions,
    permission_name,
    onCreatePermission,
    onCreateSuperPermission,
    onDeletePermission,
    onValueChange,
  }) => {

  const is_edit = is_defined(id);
  const has_groups = is_defined(all_groups) && all_groups.length > 0;
  const has_permissions = is_defined(all_permissions) &&
    all_permissions.length > 0;
  return (
    <Layout flex="column">
      <FormGroup title={_('Name')}>
        <TextField
          name="name"
          grow="1"
          value={name}
          size="30"
          onChange={onValueChange}
          maxLength="80"/>
      </FormGroup>

      <FormGroup
        title={_('Comment')}
        flex="column">
        <TextField
          name="comment"
          value={comment}
          size="30"
          maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup
        title={_('Users')}>
        <Select2
          multiple
          name="users"
          value={users}
          onChange={onValueChange}
        >
          {
            map(all_users, user => {
              return (
                <option
                  key={user.id}
                  value={user.name}>
                  {user.name}
                </option>
              );
            })
          }
        </Select2>
      </FormGroup>

      {is_edit &&
        <Layout flex="column">
          <h2>{_('New Permission')}</h2>

          <FormGroup
            title={_('Name')}
            flex align={['space-between', 'center']}>
            <Select2
              name="permission"
              value={permission_name}
              onChange={onValueChange}
            >
              {
                map(all_permissions, permission => {
                  return (
                    <option key={permission.name}
                      value={permission.name}>
                      {permission.name + ' (' +
                        permission_description(permission.name) + ')'}
                    </option>
                  );
                })
              }
            </Select2>
            <Button
              title={_('Create Permission')}
              disabled={in_use || !has_permissions}
              value={{role_id: id, name: permission_name}}
              onClick={onCreatePermission}
            />
          </FormGroup>

          <h2>{_('New Super Permission')}</h2>

          <FormGroup
            title={_('Group')}
            flex align={['space-between', 'center']}>
            <Select2
              name="group_id"
              value={group_id}
              onChange={onValueChange}
            >
              {
                map(all_groups, group => {
                  return (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  );
                })
              }
            </Select2>
            <Button
              title={_('Create Permission')}
              disabled={!has_groups}
              value={{role_id: id, group_id}}
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
                            value={{role_id: id, permission_id: permission.id}}
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
};

Dialog.propTypes = {
  all_groups: PropTypes.arrayLike,
  all_permissions: PropTypes.arrayLike,
  all_users: PropTypes.arrayLike,
  comment: PropTypes.string,
  group_id: PropTypes.id,
  id: PropTypes.id,
  in_use: PropTypes.bool,
  name: PropTypes.string,
  permissions: PropTypes.arrayLike,
  permission_name: PropTypes.string,
  users: PropTypes.arrayLike,
  onCreatePermission: PropTypes.func.isRequired,
  onCreateSuperPermission: PropTypes.func.isRequired,
  onDeletePermission: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
};


export default withDialog(Dialog, {
  title: _('New Role'),
  footer: _('Save'),
  defaultState: {
    name: _('Unnamed'),
  },
});

// vim: set ts=2 sw=2 tw=80:
