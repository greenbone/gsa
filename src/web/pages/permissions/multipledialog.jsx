/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import {typeName, getEntityType} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';

import Divider from 'web/components/layout/divider';
import Row from 'web/components/layout/row';

import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

export const CURRENT_RESOURCE_ONLY = '0';
export const INCLUDE_RELATED_RESOURCES = '1';
export const RELATED_RESOURCES_ONLY = '2';

const EntityName = styled.div`
  font-style: italic;
  word-break: break-all;
`;

const MultiplePermissionDialog = ({
  entityName = '',
  entityType = '',
  groupId,
  groups = [],
  id,
  includeRelated = INCLUDE_RELATED_RESOURCES,
  permission = 'read',
  related = [],
  roleId,
  roles = [],
  subjectType = 'user',
  title,
  userId,
  users = [],
  onChange,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const hasRelated = related.length > 0;

  title = title || _('Create Permission');

  const defaultValues = {
    permission,
    subjectType,
  };

  const values = {
    includeRelated,
    groupId,
    id,
    entityType,
    related,
    roleId,
    userId,
  };

  const includeRelatedItems = [];
  if (hasRelated || includeRelated === INCLUDE_RELATED_RESOURCES) {
    includeRelatedItems.push({
      label: _('including related resources'),
      value: INCLUDE_RELATED_RESOURCES,
    });
  }

  includeRelatedItems.push({
    label: _('for current resource only'),
    value: CURRENT_RESOURCE_ONLY,
  });

  if (hasRelated || includeRelated === RELATED_RESOURCES_ONLY) {
    includeRelatedItems.push({
      label: _('for related resources only'),
      value: RELATED_RESOURCES_ONLY,
    });
  }

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={defaultValues}
      values={values}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Grant')} direction="row">
              <Select
                grow="1"
                name="permission"
                value={state.permission}
                items={[
                  {
                    label: _('read'),
                    value: 'read',
                  },
                  {
                    label: _('write'),
                    value: 'write',
                  },
                ]}
                onChange={onValueChange}
              />
              <span>{_('Permission')}</span>
            </FormGroup>
            <FormGroup title={_('to')}>
              {capabilities.mayAccess('users') && (
                <Row>
                  <Radio
                    name="subjectType"
                    checked={state.subjectType === 'user'}
                    title={_('User')}
                    value="user"
                    onChange={onValueChange}
                  />
                  <Select
                    grow="1"
                    name="userId"
                    value={state.userId}
                    items={renderSelectItems(users)}
                    onChange={onChange}
                  />
                </Row>
              )}

              {capabilities.mayAccess('roles') && (
                <Row>
                  <Radio
                    name="subjectType"
                    checked={state.subjectType === 'role'}
                    title={_('Role')}
                    value="role"
                    onChange={onValueChange}
                  />
                  <Select
                    grow="1"
                    name="roleId"
                    value={state.roleId}
                    items={renderSelectItems(roles)}
                    onChange={onChange}
                  />
                </Row>
              )}

              {capabilities.mayAccess('groups') && (
                <Row>
                  <Radio
                    name="subjectType"
                    checked={state.subjectType === 'group'}
                    title={_('Group')}
                    value="group"
                    onChange={onValueChange}
                  />
                  <Select
                    grow="1"
                    name="groupId"
                    value={state.groupId}
                    items={renderSelectItems(groups)}
                    onChange={onChange}
                  />
                </Row>
              )}
            </FormGroup>
            <FormGroup title={_('on')} direction="row">
              <span>{typeName(getEntityType(state))}</span>
              <EntityName>{entityName}</EntityName>
              <Select
                name="includeRelated"
                value={state.includeRelated}
                items={includeRelatedItems}
                onChange={onChange}
              />
            </FormGroup>
            <FormGroup title={_('related resource(s)')}>
              {hasRelated && (
                <ul>
                  {state.related.map(rentity => (
                    <li key={rentity.id}>
                      <Divider>
                        {typeName(getEntityType(rentity))}
                        <i>{rentity.name}</i>
                      </Divider>
                    </li>
                  ))}
                </ul>
              )}
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

MultiplePermissionDialog.propTypes = {
  entityName: PropTypes.string,
  entityType: PropTypes.string,
  groupId: PropTypes.id,
  groups: PropTypes.array,
  id: PropTypes.id.isRequired,
  includeRelated: PropTypes.oneOf([
    CURRENT_RESOURCE_ONLY,
    INCLUDE_RELATED_RESOURCES,
    RELATED_RESOURCES_ONLY,
  ]),
  permission: PropTypes.oneOf(['read', 'write']),
  related: PropTypes.array, // array of models
  roleId: PropTypes.id,
  roles: PropTypes.array,
  subjectType: PropTypes.oneOf(['user', 'role', 'group']),
  title: PropTypes.string,
  userId: PropTypes.id,
  users: PropTypes.array,
  visible: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default MultiplePermissionDialog;

// vim: set ts=2 sw=2 tw=80:
