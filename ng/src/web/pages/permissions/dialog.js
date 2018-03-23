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
import 'core-js/fn/array/includes';

import React from 'react';

import _ from 'gmp/locale.js';
import {is_empty, is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import {
  permission_description,
  render_select_items,
} from '../../utils/render.js';
import withCapabilities from '../../utils/withCapabilities.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Select from '../../components/form/select.js';
import TextField from '../../components/form/textfield.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

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

class PermissionDialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {name: 'Super'};

    this.handleNameChange = this.handleNameChange.bind(this);
  }

  handleNameChange(name) {
    this.setState({name});
  }

  render() {
    const {
      capabilities,
      comment = '',
      fixedResource = false,
      group_id,
      groups = [],
      id,
      permission,
      resource_id,
      resource_type = '',
      role_id,
      roles = [],
      subject_type,
      title = _('New Permission'),
      user_id,
      users = [],
      visible,
      onClose,
      onSave,
    } = this.props;

    const {name} = this.state;

    const show_resource_id = need_resource_id.includes(name);

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

    const perm_opts = [];

    capabilities.forEach(cap => {
      perm_opts.push(
        <option
          key={cap}
          value={cap}>
          {cap} ({permission_description(cap)})
        </option>
      );
    });

    const data = {
      comment,
      fixedResource,
      group_id,
      groups,
      id,
      permission,
      resource,
      resource_id,
      resource_id_title,
      resource_type,
      role_id,
      roles,
      subject,
      subject_obj,
      subject_type,
      title,
      user_id,
      users,
    };

    return (
      <SaveDialog
        visible={visible}
        title={title}
        onClose={onClose}
        onSave={onSave}
        defaultValues={data}
        values={{name}}
      >
        {({
          values: state,
          onValueChange,
        }) => {
          return (
            <Layout flex="column">

              <FormGroup title={_('Name')}>
                <Select
                  name="name"
                  value={state.name}
                  width="300"
                  onChange={this.handleNameChange}>
                  <option value="Super">
                    {_('Super (Has super access)')}
                  </option>
                  {perm_opts}
                </Select>
              </FormGroup>

              <FormGroup title={_('Comment')}>
                <TextField
                  name="comment"
                  value={state.comment}
                  grow="1"
                  size="30"
                  maxLength="400"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('Subject')}
                flex="column">
                <Divider flex="column">
                  {capabilities.mayAccess('users') &&
                    <Divider>
                      <Radio
                        name="subject_type"
                        checked={state.subject_type === 'user'}
                        title={_('User')}
                        value="user"
                        onChange={onValueChange}>
                      </Radio>
                      <Select
                        name="user_id"
                        items={render_select_items(users)}
                        value={state.user_id}
                        onChange={onValueChange}
                      />
                    </Divider>
                  }
                  {capabilities.mayAccess('roles') &&
                    <Divider>
                      <Radio
                        name="subject_type"
                        checked={state.subject_type === 'role'}
                        title={_('Role')}
                        value="role"
                        onChange={onValueChange}>
                      </Radio>
                      <Select
                        name="role_id"
                        items={render_select_items(roles)}
                        value={state.role_id}
                        onChange={onValueChange}
                      />
                    </Divider>
                  }
                  {capabilities.mayAccess('groups') &&
                    <Divider>
                      <Radio
                        name="subject_type"
                        checked={state.subject_type === 'group'}
                        title={_('Group')}
                        value="group"
                        onChange={onValueChange}>
                      </Radio>
                      <Select
                        name="group_id"
                        items={render_select_items(groups)}
                        value={state.group_id}
                        onChange={onValueChange}
                      />
                    </Divider>
                  }
                </Divider>
              </FormGroup>

              {state.name === 'Super' &&
                <FormGroup title={_('Resource Type')}>
                  <Select
                    name="resource_type"
                    value={state.resource_type}
                    onChange={onValueChange}>
                    <option value="">--</option>
                    <option value="user">{_('User')}</option>
                    <option value="role">{_('Role')}</option>
                    <option value="group">{_('Group')}</option>
                  </Select>
                </FormGroup>
              }
              {show_resource_id &&
                <FormGroup title={state.resource_id_title}>
                  <TextField
                    name="resource_id"
                    value={state.resource_id}
                    disabled={fixedResource}
                    size="50"
                    maxLength="100"
                    onChange={onValueChange}
                  />
                </FormGroup>
              }
              <FormGroup title={_('Description')}>
                {permission_description(
                  state.name, state.resource, state.subject)}
              </FormGroup>

            </Layout>
          );
        }}
      </SaveDialog>
    );
  }
};

PermissionDialog.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  fixedResource: PropTypes.bool,
  group_id: PropTypes.id,
  groups: PropTypes.array,
  id: PropTypes.string,
  name: PropTypes.string,
  permission: PropTypes.model,
  resource_id: PropTypes.string,
  resource_type: PropTypes.string,
  role_id: PropTypes.id,
  roles: PropTypes.array,
  subject_type: PropTypes.oneOf([
    'user', 'role', 'group',
  ]),
  title: PropTypes.string,
  user_id: PropTypes.id,
  users: PropTypes.array,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default withCapabilities(PermissionDialog);

// vim: set ts=2 sw=2 tw=80:
