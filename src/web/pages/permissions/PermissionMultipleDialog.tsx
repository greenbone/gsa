/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Group from 'gmp/models/group';
import Model from 'gmp/models/model';
import Role from 'gmp/models/role';
import User from 'gmp/models/user';
import {typeName, getEntityType, EntityType} from 'gmp/utils/entitytype';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import Divider from 'web/components/layout/Divider';
import Row from 'web/components/layout/Row';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

type IncludeRelatedType =
  | typeof CURRENT_RESOURCE_ONLY
  | typeof INCLUDE_RELATED_RESOURCES
  | typeof RELATED_RESOURCES_ONLY;
type PermissionType = 'read' | 'write';
type SubjectType = 'user' | 'role' | 'group';

interface PermissionMultipleDialogSaveData {
  includeRelated?: IncludeRelatedType;
  groupId?: string;
  id: string;
  entityType?: string;
  related?: Model[];
  roleId?: string;
  userId?: string;
  permission?: PermissionType;
  subjectType?: SubjectType;
}

interface PermissionMultipleDialogProps {
  entityName?: string;
  entityType?: EntityType;
  groupId?: string;
  groups?: Group[];
  id: string;
  includeRelated?: IncludeRelatedType;
  permission?: PermissionType;
  related?: Model[];
  roleId?: string;
  roles?: Role[];
  subjectType?: SubjectType;
  title?: string;
  userId?: string;
  users?: User[];
  onChange?: (value: unknown, name?: string) => void;
  onClose: () => void;
  onSave: (data: PermissionMultipleDialogSaveData) => void | Promise<void>;
}

interface SaveDialogValues {
  includeRelated?: IncludeRelatedType;
  groupId?: string;
  id: string;
  entityType?: EntityType;
  related?: Model[];
  roleId?: string;
  userId?: string;
}

interface SaveDialogDefaultValues {
  permission: PermissionType;
  subjectType: SubjectType;
}

export const CURRENT_RESOURCE_ONLY = '0';
export const INCLUDE_RELATED_RESOURCES = '1';
export const RELATED_RESOURCES_ONLY = '2';

const EntityName = styled.div`
  font-style: italic;
  word-break: break-all;
`;

const PermissionMultipleDialog = ({
  entityName = '',
  entityType,
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
}: PermissionMultipleDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const hasRelated = related.length > 0;

  title = title || _('Create Permission');

  const defaultValues: SaveDialogDefaultValues = {
    permission,
    subjectType,
  };

  const values: SaveDialogValues = {
    includeRelated,
    groupId,
    id,
    entityType,
    related,
    roleId,
    userId,
  };

  const includeRelatedItems: Array<{
    label: string;
    value: IncludeRelatedType;
  }> = [];
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
    <SaveDialog<SaveDialogValues, SaveDialogDefaultValues>
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
                data-testid="permission-select"
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
              {capabilities.mayAccess('user') && (
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
                    items={renderSelectItems(users as RenderSelectItemProps[])}
                    name="userId"
                    value={state.userId}
                    onChange={onChange}
                  />
                </Row>
              )}

              {capabilities.mayAccess('role') && (
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
                    items={renderSelectItems(roles as RenderSelectItemProps[])}
                    name="roleId"
                    value={state.roleId}
                    onChange={onChange}
                  />
                </Row>
              )}

              {capabilities.mayAccess('group') && (
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
                    items={renderSelectItems(groups as RenderSelectItemProps[])}
                    name="groupId"
                    value={state.groupId}
                    onChange={onChange}
                  />
                </Row>
              )}
            </FormGroup>
            <FormGroup direction="row" title={_('on')}>
              <span>{typeName(state.entityType)}</span>
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
                  {(state.related || []).map(relatedEntity => (
                    <li key={relatedEntity.id}>
                      <Divider>
                        {typeName(getEntityType(relatedEntity))}
                        <i>{relatedEntity.name}</i>
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

export default PermissionMultipleDialog;
