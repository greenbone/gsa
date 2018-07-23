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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';
import {
  permissionDescription,
  renderSelectItems,
} from '../../utils/render.js';
import withCapabilities from '../../utils/withCapabilities.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Select from '../../components/form/select.js';
import TextField from '../../components/form/textfield.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';
import Model from 'gmp/model.js';

const NEED_RESOURCE_ID = [
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
  capabilities,
  comment = '',
  fixedResource = false,
  groupId,
  groups = [],
  id,
  name = 'Super',
  permission,
  resourceId,
  resourceType = '',
  roleId,
  roles = [],
  subjectType,
  title = _('New Permission'),
  userId,
  users = [],
  visible,
  onClose,
  onSave,
}) => {

  const permItems = [{
    value: 'Super',
    label: _('Super (Has super access)'),
  }];

  capabilities.forEach(cap => {
    permItems.push({
      label: `${cap} ${permissionDescription(cap)}`,
      value: cap,
    });
  });

  const data = {
    comment,
    groupId,
    id,
    name,
    permission,
    resourceId,
    resourceType,
    roleId,
    subjectType,
    title,
    userId,
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
    >
      {({
        values: state,
        onValueChange,
      }) => {
        const showResourceId = NEED_RESOURCE_ID.includes(state.name);

        const resource = isDefined(state.resourceType) ? new Model({
          name: state.resourceId,
        }, state.resourceType) : undefined;

        let subject;
        if (state.subjectType === 'user') {
          subject = users.find(user => user.id === state.userId);
        }
        else if (state.subjectType === 'role') {
          subject = roles.find(role => role.id === state.roleId);
        }
        else {
          subject = groups.find(group => group.id === state.groupId);
        }

        let resourceIdTitle;
        if (state.resourceType === 'user') {
          resourceIdTitle = _('User ID');
        }
        else if (state.resourceType === 'role') {
          resourceIdTitle = _('Role ID');
        }
        else if (state.resourceType === 'group') {
          resourceIdTitle = _('Group ID');
        }
        else {
          resourceIdTitle = _('Resource ID');
        }

        return (
          <Layout flex="column">

            <FormGroup title={_('Name')}>
              <Select
                name="name"
                value={state.name}
                items={permItems}
                width="300"
                onChange={onValueChange}
              />
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
              flex="column"
            >
              <Divider flex="column">
                {capabilities.mayAccess('users') &&
                  <Divider>
                    <Radio
                      name="subjectType"
                      checked={state.subjectType === 'user'}
                      title={_('User')}
                      value="user"
                      onChange={onValueChange}
                    >
                    </Radio>
                    <Select
                      name="userId"
                      items={renderSelectItems(users)}
                      value={state.userId}
                      onChange={onValueChange}
                    />
                  </Divider>
                }
                {capabilities.mayAccess('roles') &&
                  <Divider>
                    <Radio
                      name="subjectType"
                      checked={state.subjectType === 'role'}
                      title={_('Role')}
                      value="role"
                      onChange={onValueChange}
                    >
                    </Radio>
                    <Select
                      name="roleId"
                      items={renderSelectItems(roles)}
                      value={state.roleId}
                      onChange={onValueChange}
                    />
                  </Divider>
                }
                {capabilities.mayAccess('groups') &&
                  <Divider>
                    <Radio
                      name="subjectType"
                      checked={state.subjectType === 'group'}
                      title={_('Group')}
                      value="group"
                      onChange={onValueChange}
                    >
                    </Radio>
                    <Select
                      name="groupId"
                      items={renderSelectItems(groups)}
                      value={state.groupId}
                      onChange={onValueChange}
                    />
                  </Divider>
                }
              </Divider>
            </FormGroup>

            {state.name === 'Super' &&
              <FormGroup title={_('Resource Type')}>
                <Select
                  name="resourceType"
                  value={state.resourceType}
                  onChange={onValueChange}
                >
                  <option value="">--</option>
                  <option value="user">{_('User')}</option>
                  <option value="role">{_('Role')}</option>
                  <option value="group">{_('Group')}</option>
                </Select>
              </FormGroup>
            }
            {showResourceId &&
              <FormGroup title={resourceIdTitle}>
                <TextField
                  name="resourceId"
                  value={state.resourceId}
                  disabled={fixedResource}
                  size="50"
                  maxLength="100"
                  onChange={onValueChange}
                />
              </FormGroup>
            }
            <FormGroup title={_('Description')}>
              {permissionDescription(state.name, resource, subject)}
            </FormGroup>

          </Layout>
        );
      }}
    </SaveDialog>
  );
};

PermissionDialog.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  fixedResource: PropTypes.bool,
  groupId: PropTypes.id,
  groups: PropTypes.array,
  id: PropTypes.string,
  name: PropTypes.string,
  permission: PropTypes.model,
  resourceId: PropTypes.string,
  resourceType: PropTypes.string,
  roleId: PropTypes.id,
  roles: PropTypes.array,
  subjectType: PropTypes.oneOf([
    'user', 'role', 'group',
  ]),
  title: PropTypes.string,
  userId: PropTypes.id,
  users: PropTypes.array,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default withCapabilities(PermissionDialog);

// vim: set ts=2 sw=2 tw=80:
