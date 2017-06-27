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

import _ from '../../locale.js';
import {includes, is_empty, is_defined, map} from '../../utils.js';

import PropTypes from '../proptypes.js';

import {withDialog} from '../components/dialog/dialog.js';

import FormGroup from '../components/form/formgroup.js';
import Radio from '../components/form/radio.js';
import Select2 from '../components/form/select2.js';
import TextField from '../components/form/textfield.js';

import Layout from '../components/layout/layout.js';

import {permission_description} from '../render.js';

const need_resource_id = [
  'Super',
  'delete_agent',
  'delete_alert',
  'delete_asset',
  'delete_config',
  'delete_credential',
  'delete_filter',
  'delete_group',
  'delete_note',
  'delete_override',
  'delete_permission',
  'delete_port_list',
  'delete_port_range',
  'delete_report',
  'delete_report_format',
  'delete_role',
  'delete_scanner',
  'delete_schedule',
  'delete_tag',
  'delete_target',
  'delete_task',
  'delete_user',
  'describe_auth',
  'get_agents',
  'get_alerts',
  'get_assets',
  'get_configs',
  'get_credentials',
  'get_feeds',
  'get_filters',
  'get_groups',
  'get_info',
  'get_notes',
  'get_nvts',
  'get_overrides',
  'get_permissions',
  'get_port_lists',
  'get_reports',
  'get_report_formats',
  'get_results',
  'get_roles',
  'get_scanners',
  'get_schedules',
  'get_settings',
  'get_tags',
  'get_targets',
  'get_tasks',
  'get_users',
  'modify_agent',
  'modify_alert',
  'modify_asset',
  'modify_config',
  'modify_credential',
  'modify_filter',
  'modify_group',
  'modify_note',
  'modify_override',
  'modify_permission',
  'modify_port_list',
  'modify_report',
  'modify_report_format',
  'modify_role',
  'modify_scanner',
  'modify_schedule',
  'modify_setting',
  'modify_tag',
  'modify_target',
  'modify_task',
  'modify_user',
  'move_task',
  'resume_task',
  'start_task',
  'stop_task',
  'test_alert',
  'verify_agent',
  'verify_report_format',
  'verify_scanner',
];

const PermissionDialog = ({
    permission,
    comment,
    name,
    group_id,
    role_id,
    user_id,
    resource_id,
    resource_type,
    roles = [],
    groups = [],
    users = [],
    subject_type,
    onValueChange,
  }, {capabilities}) => {

  let show_resource_id = includes(need_resource_id, name);

  let resource_id_title;
  if (resource_type === 'user') {
    resource_id_title = _('User ID');
  }
  else if (resource_type === 'role') {
    resource_id_title = _('Role ID');
  }
  else if (resource_type === 'group') {
    resource_id_title = _('Group ID');
  }
  else {
    resource_id_title = _('Resource ID');
  }

  const resource = is_empty(resource_type) ? undefined : {
    type: resource_type,
    name: resource_id,
  };

  let subject_obj;
  if (subject_type === 'user') {
    subject_obj = users.find(user => user.id === user_id);
  }
  else if (subject_type === 'role') {
    subject_obj = roles.find(role => role.id === role_id);
  }
  else {
    subject_obj = groups.find(group => group.id === group_id);
  }

  const subject = {
  };

  if (is_defined(subject_obj)) {
    subject.type = subject_type;
    subject.name = subject_obj.name;
  }

  let perm_opts = [];

  capabilities.forEach(cap => {
    perm_opts.push(
      <option
        key={cap}
        value={cap}>
        {cap} ({permission_description(cap)})
      </option>
    );
  });

  return (
    <Layout flex="column">

      <FormGroup title={_('Name')}>
        <Select2
          name="name"
          value={name}
          onChange={onValueChange}>
          <option value="Super">
            {_('Super (Has super access)')}
          </option>
          {perm_opts}
        </Select2>
      </FormGroup>

      <FormGroup title={_('Comment')}>
        <TextField
          name="comment"
          value={comment}
          grow="1"
          size="30"
          maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Subject')}
        flex="column">
        {capabilities.mayAccess('users') &&
          <Layout flex box>
            <Radio
              name="subject_type"
              checked={subject_type === 'user'}
              title={_('User')}
              value="user"
              onChange={onValueChange}>
            </Radio>
            <Select2
              name="user_id"
              value={user_id}
              onChange={onValueChange}>
              {map(users, user => {
                return (
                  <option
                    key={user.id}
                    value={user.id}>
                    {user.name}
                  </option>
                );
              })}
            </Select2>
          </Layout>
        }

        {capabilities.mayAccess('roles') &&
          <Layout flex box>
            <Radio
              name="subject_type"
              checked={subject_type === 'role'}
              title={_('Role')}
              value="role"
              onChange={onValueChange}>
            </Radio>
            <Select2
              name="role_id"
              value={role_id}
              onChange={onValueChange}>
              {map(roles, role => {
                return (
                  <option
                    key={role.id}
                    value={role.id}>
                    {role.name}
                  </option>
                );
              })}
            </Select2>
          </Layout>
        }

        {capabilities.mayAccess('groups') &&
          <Layout flex box>
            <Radio
              name="subject_type"
              checked={subject_type === 'group'}
              title={_('Group')}
              value="group"
              onChange={onValueChange}>
            </Radio>
            <Select2
              name="group_id"
              value={group_id}
              onChange={onValueChange}>
              {map(groups, group => {
                return (
                  <option
                    key={group.id}
                    value={group.id}>
                    {group.name}
                  </option>
                );
              })}
            </Select2>
          </Layout>
        }
      </FormGroup>

      {name === 'Super' &&
        <FormGroup title={_('Resource Type')}>
          <Select2
            name="resource_type"
            value={resource_type}
            onChange={onValueChange}>
            <option value="">--</option>
            <option value="user">{_('User')}</option>
            <option value="role">{_('Role')}</option>
            <option value="group">{_('Group')}</option>
          </Select2>
        </FormGroup>
      }
      {show_resource_id &&
        <FormGroup title={resource_id_title}>
          <TextField
            name="resource_id"
            value={resource_id}
            size="50"
            maxLength="100"
            onChange={onValueChange}/>
        </FormGroup>
      }
      <FormGroup title={_('Description')}>
        {permission_description(name, resource, subject)}
      </FormGroup>

    </Layout>
  );
};

PermissionDialog.propTypes = {
  comment: PropTypes.string,
  groups: PropTypes.arrayLike,
  name: PropTypes.string,
  permission: PropTypes.model,
  group_id: PropTypes.id,
  role_id: PropTypes.id,
  user_id: PropTypes.id,
  resource_id: PropTypes.string,
  resource_type: PropTypes.string,
  roles: PropTypes.arrayLike,
  subject_type: PropTypes.oneOf([
    'user', 'role', 'group',
  ]),
  users: PropTypes.arrayLike,
  onValueChange: PropTypes.func,
};

PermissionDialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withDialog(PermissionDialog, {
  title: _('New Permission'),
  footer: _('Save'),
  defaultState: {
    name: 'Super',
    comment: '',
    resource_type: '',
  },
});

// vim: set ts=2 sw=2 tw=80:
