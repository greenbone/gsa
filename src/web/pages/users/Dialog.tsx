/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {type CapabilitiesEntityType} from 'gmp/capabilities/capabilities';
import type Model from 'gmp/models/model';
import type Settings from 'gmp/models/settings';
import {
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
  AUTH_METHOD_LDAP,
  AUTH_METHOD_NEW_PASSWORD,
  AUTH_METHOD_PASSWORD,
  AUTH_METHOD_RADIUS,
  type default as User,
} from 'gmp/models/user';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/DialogTwoButtonFooter';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import PasswordField from 'web/components/form/PasswordField';
import Radio from 'web/components/form/Radio';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import useUserName from 'web/hooks/useUserName';

interface AuthMethodSetting {
  enabled?: boolean;
}

interface ControlledDialogValues {
  role_ids: string[];
}

export interface UserDialogSaveData {
  id?: string;
  access_hosts: string;
  auth_method: string;
  comment: string;
  group_ids: string[];
  groups?: Model[];
  hosts_allow: string;
  name: string;
  old_name?: string;
  password: string;
  role_ids: string[];
  roles?: Model[];
}

interface UserDialogProps {
  roleIds?: string[];
  accessHosts?: string;
  comment?: string;
  groups?: Model[];
  groupIds?: string[];
  hostsAllow?: string;
  name?: string;
  oldName?: string;
  password?: string;
  roles?: Model[];
  settings: Settings;
  title?: string;
  user?: User;
  onClose: () => void;
  onSave: (data: UserDialogSaveData) => void | Promise<void>;
}

const Dialog = ({
  roleIds: initialRoleIds = [],
  accessHosts = '',
  comment = '',
  groups,
  groupIds = [],
  hostsAllow = ACCESS_ALLOW_ALL,
  name,
  oldName,
  password = '',
  roles,
  settings,
  title,
  user,
  onClose,
  onSave,
}: UserDialogProps) => {
  const [_] = useTranslation();
  const username = useUserName();
  const capabilities = useCapabilities();
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);
  const [
    confirmationDialogVisibleSuperAdmin,
    setConfirmationDialogVisibleSuperAdmin,
  ] = useState(false);
  const [noRoleConfirmed, setNoRoleConfirmed] = useState(false);
  const [superAdminData, setSuperAdminData] = useState<
    UserDialogSaveData | undefined
  >(undefined);
  const [roleIds, setRoleIds] = useState(initialRoleIds);

  const dialogName = name || _('Unnamed');
  const dialogTitle = title || _('New User');

  const openConfirmationDialog = () => {
    setConfirmationDialogVisible(true);
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialogVisible(false);
  };

  const openConfirmationDialogSuperAdmin = () => {
    setConfirmationDialogVisibleSuperAdmin(true);
  };

  const closeConfirmationDialogSuperAdmin = () => {
    setConfirmationDialogVisibleSuperAdmin(false);
  };

  const handleResumeClick = () => {
    setNoRoleConfirmed(true);
    closeConfirmationDialog();
  };

  const handleResumeClickSuperAdmin = () => {
    closeConfirmationDialogSuperAdmin();
    if (isDefined(superAdminData)) {
      return onSave(superAdminData);
    }
  };

  const handleRoleIdsChange = (value: string[]) => {
    setNoRoleConfirmed(false);
    setRoleIds(value);
  };

  const handleSaveClick = (userData: UserDialogSaveData) => {
    if (roleIds.length > 0 || noRoleConfirmed) {
      /*
       * You reach this point, if you have at least one role in the user data
       * or you have already confirmed that you want to save the user data
       * without any role.
       */
      if (isDefined(user) && username === user.name) {
        /*
         * You reach this point only as a Super Admin, when you try to save your
         * own personal user data. The confirmation dialog opens. The data can
         * then be saved from the confirmation dialog, so we have to "return"
         * after opening the confirmation dialog.
         */
        setSuperAdminData(userData);
        openConfirmationDialogSuperAdmin();
        return;
      }
      return onSave(userData);
    }
    openConfirmationDialog();
  };

  const isEdit = isDefined(user);

  const data: UserDialogSaveData = {
    ...user,
    access_hosts: accessHosts,
    auth_method:
      isEdit && isDefined(user.authMethod)
        ? user.authMethod
        : AUTH_METHOD_PASSWORD,
    comment,
    group_ids: groupIds,
    groups,
    hosts_allow: hostsAllow,
    name: dialogName,
    old_name: oldName,
    password,
    role_ids: roleIds,
    roles,
  };

  const controlledValues: ControlledDialogValues = {
    role_ids: roleIds,
  };

  const rolesOptions = map(roles, role => ({
    label: role.name ?? '',
    value: role.id ?? '',
  }));

  const groupsOptions = map(groups, group => ({
    label: group.name ?? '',
    value: group.id ?? '',
  }));

  const hasLdapEnabled =
    (settings.get('method:ldap_connect') as AuthMethodSetting).enabled === true;
  const hasRadiusEnabled =
    (settings.get('method:radius_connect') as AuthMethodSetting).enabled ===
    true;

  return (
    <SaveDialog<ControlledDialogValues, UserDialogSaveData>
      defaultValues={data}
      title={dialogTitle}
      values={controlledValues}
      onClose={onClose}
      onSave={handleSaveClick}
    >
      {({values: state, onValueChange}) => (
        <>
          <FormGroup title={_('Login Name')}>
            <TextField
              name="name"
              value={state.name}
              onChange={onValueChange}
            />
          </FormGroup>

          <FormGroup title={_('Comment')}>
            <TextField
              name="comment"
              value={state.comment}
              onChange={onValueChange}
            />
          </FormGroup>

          {!isEdit && (
            <FormGroup direction="column" title={_('Authentication')}>
              <Row>
                <Radio
                  checked={state.auth_method === AUTH_METHOD_PASSWORD}
                  name="auth_method"
                  title={_('Password')}
                  value={AUTH_METHOD_PASSWORD}
                  onChange={onValueChange}
                />
                <PasswordField
                  autoComplete="new-password"
                  grow="1"
                  name="password"
                  value={state.password}
                  onChange={onValueChange}
                />
              </Row>
              {hasLdapEnabled && (
                <Radio
                  checked={state.auth_method === AUTH_METHOD_LDAP}
                  name="auth_method"
                  title={_('LDAP Authentication Only')}
                  value={AUTH_METHOD_LDAP}
                  onChange={onValueChange}
                />
              )}
              {hasRadiusEnabled && (
                <Radio
                  checked={state.auth_method === AUTH_METHOD_RADIUS}
                  name="auth_method"
                  title={_('RADIUS Authentication Only')}
                  value={AUTH_METHOD_RADIUS}
                  onChange={onValueChange}
                />
              )}
            </FormGroup>
          )}

          {isEdit && (
            <FormGroup title={_('Authentication')}>
              <Radio
                checked={state.auth_method === AUTH_METHOD_PASSWORD}
                name="auth_method"
                title={_('Password: Use existing Password')}
                value={AUTH_METHOD_PASSWORD}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.auth_method === AUTH_METHOD_NEW_PASSWORD}
                  name="auth_method"
                  title={_('New Password')}
                  value={AUTH_METHOD_NEW_PASSWORD}
                  onChange={onValueChange}
                />
                <PasswordField
                  autoComplete="new-password"
                  disabled={state.auth_method !== AUTH_METHOD_NEW_PASSWORD}
                  grow="1"
                  name="password"
                  value={state.password}
                  onChange={onValueChange}
                />
              </Row>
              {hasLdapEnabled && (
                <Radio
                  checked={state.auth_method === AUTH_METHOD_LDAP}
                  name="auth_method"
                  title={_('LDAP Authentication Only')}
                  value={AUTH_METHOD_LDAP}
                  onChange={onValueChange}
                />
              )}
              {hasRadiusEnabled && (
                <Radio
                  checked={state.auth_method === AUTH_METHOD_RADIUS}
                  name="auth_method"
                  title={_('RADIUS Authentication Only')}
                  value={AUTH_METHOD_RADIUS}
                  onChange={onValueChange}
                />
              )}
            </FormGroup>
          )}
          {capabilities.mayAccess('roles' as CapabilitiesEntityType) && (
            <FormGroup title={_('Roles')}>
              <MultiSelect
                items={rolesOptions}
                name="role_ids"
                value={roleIds}
                onChange={handleRoleIdsChange}
              />
            </FormGroup>
          )}

          {capabilities.mayAccess('groups' as CapabilitiesEntityType) && (
            <FormGroup title={_('Groups')}>
              <MultiSelect
                items={groupsOptions}
                name="group_ids"
                value={state.group_ids}
                onChange={onValueChange}
              />
            </FormGroup>
          )}

          <FormGroup title={_('Host Access')}>
            <Row>
              <Radio
                checked={state.hosts_allow === ACCESS_ALLOW_ALL}
                name="hosts_allow"
                title={_('Allow all and deny')}
                value={ACCESS_ALLOW_ALL}
                onChange={onValueChange}
              />
              <Radio
                checked={state.hosts_allow === ACCESS_DENY_ALL}
                name="hosts_allow"
                title={_('Deny all and allow')}
                value={ACCESS_DENY_ALL}
                onChange={onValueChange}
              />
            </Row>
            <TextField
              grow="1"
              name="access_hosts"
              value={state.access_hosts}
              onChange={onValueChange}
            />
          </FormGroup>
          {confirmationDialogVisibleSuperAdmin && (
            <ConfirmationDialog
              content={_(
                'Please note: You are about to change your own personal user data ' +
                  'as Super Admin! It is not possible to change the login name. ' +
                  'If you have modified the login name, neither the login name nor ' +
                  'any other changes made will be saved. ' +
                  'If you have made any modifications other than the login name, ' +
                  'the data will be saved when clicking OK, and you will be logged ' +
                  'out immediately.',
              )}
              rightButtonAction={DELETE_ACTION}
              title={_('Save Super Admin User')}
              width="400px"
              onClose={closeConfirmationDialogSuperAdmin}
              onResumeClick={handleResumeClickSuperAdmin}
            />
          )}
          {confirmationDialogVisible && (
            <ConfirmationDialog
              content={_(
                'Please note: You are about to create a user ' +
                  'without a role. This user will not have any ' +
                  'permissions and as a result will not be able to login.',
              )}
              rightButtonAction={DELETE_ACTION}
              title={_('User without a role')}
              width="400px"
              onClose={closeConfirmationDialog}
              onResumeClick={handleResumeClick}
            />
          )}
        </>
      )}
    </SaveDialog>
  );
};

export default Dialog;
