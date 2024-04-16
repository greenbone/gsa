/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';

import {isDefined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';

import {
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
  AUTH_METHOD_LDAP,
  AUTH_METHOD_NEW_PASSWORD,
  AUTH_METHOD_PASSWORD,
  AUTH_METHOD_RADIUS,
} from 'gmp/models/user';

import PropTypes from 'web/utils/proptypes';

import ConfirmationDialog from 'web/components/dialog/confirmationdialog';
import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import Radio from 'web/components/form/radio';
import MultiSelect from 'web/components/form/multiselect';
import TextField from 'web/components/form/textfield';

import Row from 'web/components/layout/row';

import useTranslation from 'web/hooks/useTranslation';
import useUserName from 'web/utils/useUserName';
import useCapabilities from 'web/utils/useCapabilities';

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
}) => {
  const [_] = useTranslation();
  const [username] = useUserName();
  const capabilities = useCapabilities();
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);
  const [
    confirmationDialogVisibleSuperAdmin,
    setConfirmationDialogVisibleSuperAdmin,
  ] = useState(false);
  const [noRoleConfirmed, setNoRoleConfirmed] = useState(false);
  const [superAdminData, setSuperAdminData] = useState({});
  const [roleIds, setRoleIds] = useState(initialRoleIds);

  name = name || _('Unnamed');
  title = title || _('New User');

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
    return onSave(superAdminData);
  };

  const handleRoleIdsChange = value => {
    setNoRoleConfirmed(false);
    setRoleIds(value);
  };

  const handleSaveClick = userData => {
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

  const data = {
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
    name,
    old_name: oldName,
    password,
    roles,
  };

  const controlledValues = {
    role_ids: roleIds,
  };

  const rolesOptions = map(roles, role => ({
    label: role.name,
    value: role.id,
  }));

  const groupsOptions = map(groups, group => ({
    label: group.name,
    value: group.id,
  }));

  const hasLdapEnabled = settings.get('method:ldap_connect').enabled;
  const hasRadiusEnabled = settings.get('method:radius_connect').enabled;

  return (
    <React.Fragment>
      <SaveDialog
        title={title}
        values={controlledValues}
        onClose={onClose}
        onSave={handleSaveClick}
        defaultValues={data}
      >
        {({values: state, onValueChange}) => (
          <React.Fragment>
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
              <FormGroup title={_('Authentication')} flex="column">
                <Row>
                  <Radio
                    title={_('Password')}
                    name="auth_method"
                    value={AUTH_METHOD_PASSWORD}
                    checked={state.auth_method === AUTH_METHOD_PASSWORD}
                    onChange={onValueChange}
                  />
                  <PasswordField
                    grow="1"
                    name="password"
                    autoComplete="new-password"
                    value={state.password}
                    onChange={onValueChange}
                  />
                </Row>
                {hasLdapEnabled && (
                  <Radio
                    title={_('LDAP Authentication Only')}
                    name="auth_method"
                    value={AUTH_METHOD_LDAP}
                    checked={state.auth_method === AUTH_METHOD_LDAP}
                    onChange={onValueChange}
                  />
                )}
                {hasRadiusEnabled && (
                  <Radio
                    title={_('RADIUS Authentication Only')}
                    name="auth_method"
                    value={AUTH_METHOD_RADIUS}
                    checked={state.auth_method === AUTH_METHOD_RADIUS}
                    onChange={onValueChange}
                  />
                )}
              </FormGroup>
            )}

            {isEdit && (
              <FormGroup title={_('Authentication')}>
                <Radio
                  title={_('Password: Use existing Password')}
                  name="auth_method"
                  value={AUTH_METHOD_PASSWORD}
                  checked={state.auth_method === AUTH_METHOD_PASSWORD}
                  onChange={onValueChange}
                />
                <Row>
                  <Radio
                    title={_('New Password')}
                    name="auth_method"
                    value={AUTH_METHOD_NEW_PASSWORD}
                    checked={state.auth_method === AUTH_METHOD_NEW_PASSWORD}
                    onChange={onValueChange}
                  />
                  <PasswordField
                    grow="1"
                    name="password"
                    autoComplete="new-password"
                    disabled={state.auth_method !== AUTH_METHOD_NEW_PASSWORD}
                    value={state.password}
                    onChange={onValueChange}
                  />
                </Row>
                {hasLdapEnabled && (
                  <Radio
                    title={_('LDAP Authentication Only')}
                    name="auth_method"
                    value={AUTH_METHOD_LDAP}
                    checked={state.auth_method === AUTH_METHOD_LDAP}
                    onChange={onValueChange}
                  />
                )}
                {hasRadiusEnabled && (
                  <Radio
                    title={_('RADIUS Authentication Only')}
                    name="auth_method"
                    value={AUTH_METHOD_RADIUS}
                    checked={state.auth_method === AUTH_METHOD_RADIUS}
                    onChange={onValueChange}
                  />
                )}
              </FormGroup>
            )}
            {capabilities.mayAccess('roles') && (
              <FormGroup title={_('Roles')}>
                <MultiSelect
                  name="role_ids"
                  items={rolesOptions}
                  value={roleIds}
                  onChange={handleRoleIdsChange}
                />
              </FormGroup>
            )}

            {capabilities.mayAccess('groups') && (
              <FormGroup title={_('Groups')}>
                <MultiSelect
                  name="group_ids"
                  items={groupsOptions}
                  value={state.group_ids}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            <FormGroup title={_('Host Access')}>
              <Row>
                <Radio
                  name="hosts_allow"
                  title={_('Allow all and deny')}
                  value={ACCESS_ALLOW_ALL}
                  checked={state.hosts_allow === ACCESS_ALLOW_ALL}
                  onChange={onValueChange}
                />
                <Radio
                  name="hosts_allow"
                  title={_('Deny all and allow')}
                  value={ACCESS_DENY_ALL}
                  checked={state.hosts_allow === ACCESS_DENY_ALL}
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
                title={_('User without a role')}
                width="400px"
                onClose={closeConfirmationDialog}
                onResumeClick={handleResumeClick}
              />
            )}
          </React.Fragment>
        )}
      </SaveDialog>
    </React.Fragment>
  );
};

Dialog.propTypes = {
  accessHosts: PropTypes.string,
  authMethod: PropTypes.oneOf([
    AUTH_METHOD_LDAP,
    AUTH_METHOD_NEW_PASSWORD,
    AUTH_METHOD_PASSWORD,
    AUTH_METHOD_RADIUS,
  ]),
  comment: PropTypes.string,
  groupIds: PropTypes.array,
  groups: PropTypes.array,
  hostsAllow: PropTypes.oneOf([ACCESS_ALLOW_ALL, ACCESS_DENY_ALL]),
  id: PropTypes.id,
  name: PropTypes.string,
  oldName: PropTypes.string,
  password: PropTypes.string,
  roleIds: PropTypes.array,
  roles: PropTypes.array,
  settings: PropTypes.settings.isRequired,
  title: PropTypes.string,
  user: PropTypes.model,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
