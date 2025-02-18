/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {typeName, getEntityType} from 'gmp/utils/entitytype';
import React from 'react';
import styled from 'styled-components';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import Divider from 'web/components/layout/Divider';
import Row from 'web/components/layout/Row';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';

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
      defaultValues={defaultValues}
      title={title}
      values={values}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup direction="row" title={_('Grant')}>
              <Select
                grow="1"
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
                name="permission"
                value={state.permission}
                onChange={onValueChange}
              />
              <span>{_('Permission')}</span>
            </FormGroup>
            <FormGroup title={_('to')}>
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
                    onChange={onChange}
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
                    onChange={onChange}
                  />
                </Row>
              )}

              {capabilities.mayAccess('groups') && (
                <Row>
                  <Radio
                    checked={state.subjectType === 'group'}
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
                    onChange={onChange}
                  />
                </Row>
              )}
            </FormGroup>
            <FormGroup direction="row" title={_('on')}>
              <span>{typeName(getEntityType(state))}</span>
              <EntityName>{entityName}</EntityName>
              <Select
                items={includeRelatedItems}
                name="includeRelated"
                value={state.includeRelated}
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
