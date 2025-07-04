/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';
import {split} from 'gmp/utils/string';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {permissionDescription, renderSelectItems} from 'web/utils/Render';

const NEED_RESOURCE_ID = [
  'Super',
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
  'delete_report_config',
  'delete_report_format',
  'delete_role',
  'delete_scanner',
  'delete_schedule',
  'delete_tag',
  'delete_target',
  'delete_task',
  'delete_user',
  'describe_auth',
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
  'get_report_configs',
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
  'modify_report_config',
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
  'verify_report_format',
  'verify_scanner',
];

const PermissionDialog = ({
  comment = '',
  fixedResource = false,
  groupId,
  groups = [],
  id,
  name = 'Super',
  permission,
  resourceId = '',
  resourceName,
  resourceType,
  roleId,
  roles = [],
  subjectType,
  title,
  userId,
  users = [],
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  title = title || _('New Permission');
  const permItems = [
    {
      value: 'Super',
      label: _('Super (Has super access)'),
    },
  ];

  for (const cap of capabilities) {
    permItems.push({
      label: `${cap} ${permissionDescription(cap)}`,
      value: cap,
    });
  }

  const data = {
    comment,
    groupId,
    id,
    name,
    permission,
    resourceId,
    resourceName,
    resourceType,
    roleId,
    subjectType,
    title,
    userId,
  };

  const handleNameValueChange = onValueChange => (name, value) => {
    onValueChange(name, value);
    onValueChange(undefined, 'resourceType');
  };

  return (
    <SaveDialog
      defaultValues={data}
      title={title}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        const showResourceId = NEED_RESOURCE_ID.includes(state.name);

        const [type] = split(name, '_', 1);

        const resourceNameOrId = isDefined(state.resourceName)
          ? state.resourceName
          : state.resourceId;
        const resourceTypeOrType = isDefined(state.resourceType)
          ? state.resourceType
          : type;

        const resource = isDefined(state.resourceType)
          ? Model.fromElement({name: resourceNameOrId}, resourceTypeOrType)
          : undefined;
        let subject;
        if (state.subjectType === 'user') {
          subject = users.find(user => user.id === state.userId);
        } else if (state.subjectType === 'role') {
          subject = roles.find(role => role.id === state.roleId);
        } else {
          subject = groups.find(group => group.id === state.groupId);
        }

        let resourceIdTitle;
        if (state.resourceType === 'user') {
          resourceIdTitle = _('User ID');
        } else if (state.resourceType === 'role') {
          resourceIdTitle = _('Role ID');
        } else if (state.resourceType === 'group') {
          resourceIdTitle = _('Group ID');
        } else {
          resourceIdTitle = _('Resource ID');
        }

        return (
          <>
            <FormGroup title={_('Name')}>
              <Select
                grow="1"
                items={permItems}
                name="name"
                value={state.name}
                onChange={handleNameValueChange(onValueChange)}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                grow="1"
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Subject')}>
              {capabilities.mayAccess('users') && (
                <Row>
                  <Radio
                    checked={state.subjectType === 'user'}
                    name="subjectType"
                    title={_('User')}
                    value="user"
                    onChange={onValueChange}
                  />
                  <Select
                    grow="1"
                    items={renderSelectItems(users)}
                    name="userId"
                    value={state.userId}
                    onChange={onValueChange}
                  />
                </Row>
              )}
              {capabilities.mayAccess('roles') && (
                <Row>
                  <Radio
                    checked={state.subjectType === 'role'}
                    name="subjectType"
                    title={_('Role')}
                    value="role"
                    onChange={onValueChange}
                  />
                  <Select
                    grow="1"
                    items={renderSelectItems(roles)}
                    name="roleId"
                    value={state.roleId}
                    onChange={onValueChange}
                  />
                </Row>
              )}
              {capabilities.mayAccess('groups') && (
                <Row>
                  <Radio
                    checked={state.subjectType === 'group'}
                    disabled={groups.length === 0}
                    name="subjectType"
                    title={_('Group')}
                    value="group"
                    onChange={onValueChange}
                  />
                  <Select
                    grow="1"
                    items={renderSelectItems(groups)}
                    name="groupId"
                    value={state.groupId}
                    onChange={onValueChange}
                  />
                </Row>
              )}
            </FormGroup>

            {state.name === 'Super' && (
              <FormGroup title={_('Resource Type')}>
                <Select
                  grow="1"
                  items={[
                    {
                      value: '',
                      label: '--',
                    },
                    {
                      value: 'user',
                      label: _('User'),
                    },
                    {
                      value: 'role',
                      label: _('Role'),
                    },
                    {
                      value: 'group',
                      label: _('Group'),
                    },
                  ]}
                  name="resourceType"
                  value={state.resourceType}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}
            {showResourceId && (
              <FormGroup title={resourceIdTitle}>
                <TextField
                  disabled={fixedResource}
                  grow="1"
                  name="resourceId"
                  value={state.resourceId}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}
            <FormGroup title={_('Description')}>
              {permissionDescription(state.name, resource, subject)}
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

PermissionDialog.propTypes = {
  comment: PropTypes.string,
  fixedResource: PropTypes.bool,
  groupId: PropTypes.id,
  groups: PropTypes.array,
  id: PropTypes.string,
  name: PropTypes.string,
  permission: PropTypes.model,
  resourceId: PropTypes.string,
  resourceName: PropTypes.string,
  resourceType: PropTypes.string,
  roleId: PropTypes.id,
  roles: PropTypes.array,
  subjectType: PropTypes.oneOf(['user', 'role', 'group']),
  title: PropTypes.string,
  userId: PropTypes.id,
  users: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default PermissionDialog;
