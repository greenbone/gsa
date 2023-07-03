/* Copyright (C) 2017-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import {connect} from 'react-redux';
import {getUsername} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';

import _ from 'gmp/locale';

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
import withCapabilities from 'web/utils/withCapabilities';

import ConfirmationDialog from 'web/components/dialog/confirmationdialog';
import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import Radio from 'web/components/form/radio';
import MultiSelect from 'web/components/form/multiselect';
import TextField from 'web/components/form/textfield';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

class Dialog extends React.Component {
  constructor(...args) {
    super(...args);

    const {roleIds = []} = this.props;

    this.state = {
      confirmationDialogVisible: false,
      confirmationDialogVisibleSuperAdmin: false,
      noRoleConfirmed: false,
      roleIds,
      superAdminData: {},
    };

    this.closeConfirmationDialog = this.closeConfirmationDialog.bind(this);
    this.closeConfirmationDialogSuperAdmin =
      this.closeConfirmationDialogSuperAdmin.bind(this);
    this.openConfirmationDialogSuperAdmin =
      this.openConfirmationDialogSuperAdmin.bind(this);
    this.handleResumeClick = this.handleResumeClick.bind(this);
    this.handleResumeClickSuperAdmin =
      this.handleResumeClickSuperAdmin.bind(this);
    this.handleRoleIdsChange = this.handleRoleIdsChange.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
  }

  openConfirmationDialog() {
    this.setState({confirmationDialogVisible: true});
  }

  closeConfirmationDialog() {
    this.setState({confirmationDialogVisible: false});
  }

  openConfirmationDialogSuperAdmin() {
    this.setState({confirmationDialogVisibleSuperAdmin: true});
  }

  closeConfirmationDialogSuperAdmin() {
    this.setState({confirmationDialogVisibleSuperAdmin: false});
  }

  handleResumeClick() {
    this.setState({noRoleConfirmed: true});
    this.closeConfirmationDialog();
  }

  handleResumeClickSuperAdmin(onSave) {
    this.closeConfirmationDialogSuperAdmin();
    return onSave(this.state.superAdminData);
  }

  handleRoleIdsChange(value) {
    this.setState({
      noRoleConfirmed: false,
      roleIds: value,
    });
  }

  handleSaveClick(onSave, userData) {
    const {roleIds, noRoleConfirmed} = this.state;
    if (roleIds.length > 0 || noRoleConfirmed) {
      /*
       * You reach this point, if you have at least one role in the user data
       * or you have already confirmed that you want to save the user data
       * without any role.
       */
      if (
        isDefined(this.props.user) &&
        this.props.username === this.props.user.name
      ) {
        /*
         * You reach this point only as a Super Admin, when you try to save your
         * own personal user data. The confirmation dialog opens. The data can
         * then be saved from the confirmation dialog, so we have to "return"
         * after opening the confirmation dialog.
         */
        this.setState({superAdminData: userData});
        this.openConfirmationDialogSuperAdmin();
        return;
      }
      return onSave(userData);
    }
    this.openConfirmationDialog();
  }

  render() {
    const {
      accessHosts = '',
      capabilities,
      comment = '',
      groups,
      groupIds = [],
      hostsAllow = ACCESS_ALLOW_ALL,
      name = _('Unnamed'),
      oldName,
      password = '',
      roles,
      settings,
      title = _('New User'),
      user,
      onClose,
      onSave,
    } = this.props;

    const {
      confirmationDialogVisible,
      confirmationDialogVisibleSuperAdmin,
      roleIds,
    } = this.state;

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
          onSave={userData => this.handleSaveClick(onSave, userData)}
          defaultValues={data}
        >
          {({values: state, onValueChange}) => (
            <React.Fragment>
              <Layout flex="column">
                <FormGroup title={_('Login Name')}>
                  <TextField
                    name="name"
                    grow="1"
                    value={state.name}
                    size="30"
                    onChange={onValueChange}
                  />
                </FormGroup>

                <FormGroup title={_('Comment')}>
                  <TextField
                    name="comment"
                    value={state.comment}
                    grow="1"
                    size="30"
                    onChange={onValueChange}
                  />
                </FormGroup>

                {!isEdit && (
                  <FormGroup title={_('Authentication')} flex="column">
                    <Divider flex="column">
                      <Divider>
                        <Radio
                          title={_('Password')}
                          name="auth_method"
                          value={AUTH_METHOD_PASSWORD}
                          checked={state.auth_method === AUTH_METHOD_PASSWORD}
                          onChange={onValueChange}
                        />
                        <PasswordField
                          name="password"
                          autoComplete="new-password"
                          value={state.password}
                          onChange={onValueChange}
                        />
                      </Divider>
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
                    </Divider>
                  </FormGroup>
                )}

                {isEdit && (
                  <FormGroup title={_('Authentication')} flex="column">
                    <Divider flex="column">
                      <Radio
                        title={_('Password: Use existing Password')}
                        name="auth_method"
                        value={AUTH_METHOD_PASSWORD}
                        checked={state.auth_method === AUTH_METHOD_PASSWORD}
                        onChange={onValueChange}
                      />
                      <Divider>
                        <Radio
                          title={_('New Password')}
                          name="auth_method"
                          value={AUTH_METHOD_NEW_PASSWORD}
                          checked={
                            state.auth_method === AUTH_METHOD_NEW_PASSWORD
                          }
                          onChange={onValueChange}
                        />
                        <PasswordField
                          name="password"
                          autoComplete="new-password"
                          value={state.password}
                          onChange={onValueChange}
                        />
                      </Divider>
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
                    </Divider>
                  </FormGroup>
                )}
                {capabilities.mayAccess('roles') && (
                  <FormGroup title={_('Roles')}>
                    <MultiSelect
                      name="role_ids"
                      items={rolesOptions}
                      value={roleIds}
                      onChange={this.handleRoleIdsChange}
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
                  <Divider flex="column">
                    <Divider>
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
                    </Divider>
                    <TextField
                      name="access_hosts"
                      size="30"
                      value={state.access_hosts}
                      onChange={onValueChange}
                    />
                  </Divider>
                </FormGroup>
              </Layout>
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
                  onClose={this.closeConfirmationDialogSuperAdmin}
                  onResumeClick={s => this.handleResumeClickSuperAdmin(onSave)}
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
                  onClose={this.closeConfirmationDialog}
                  onResumeClick={this.handleResumeClick}
                />
              )}
            </React.Fragment>
          )}
        </SaveDialog>
      </React.Fragment>
    );
  }
}

Dialog.propTypes = {
  accessHosts: PropTypes.string,
  authMethod: PropTypes.oneOf([
    AUTH_METHOD_LDAP,
    AUTH_METHOD_NEW_PASSWORD,
    AUTH_METHOD_PASSWORD,
    AUTH_METHOD_RADIUS,
  ]),
  capabilities: PropTypes.capabilities.isRequired,
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
  username: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

const mapStateToProps = rootState => {
  const username = getUsername(rootState);
  return {username};
};

export default compose(withCapabilities, connect(mapStateToProps))(Dialog);

// vim: set ts=2 sw=2 tw=80:
