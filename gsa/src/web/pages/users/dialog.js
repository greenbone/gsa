/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
  AUTH_METHOD_LDAP,
  AUTH_METHOD_NEW_PASSWORD,
  AUTH_METHOD_PASSWORD,
  AUTH_METHOD_RADIUS,
} from 'gmp/models/user';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import ConfirmationDialog from 'web/components/dialog/confirmationdialog';
import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import Radio from 'web/components/form/radio';
import MultiSelect from 'web/components/form/multiselect';
import TextField from 'web/components/form/textfield';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

class Dialog extends React.Component {
  constructor(...args) {
    super(...args);

    const {roleIds = []} = this.props;

    this.state = {
      confirmationDialogVisible: false,
      noRoleConfirmed: false,
      roleIds,
    };

    this.closeConfirmationDialog = this.closeConfirmationDialog.bind(this);
    this.handleResumeClick = this.handleResumeClick.bind(this);
    this.handleRoleIdsChange = this.handleRoleIdsChange.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
  }

  closeConfirmationDialog() {
    this.setState({confirmationDialogVisible: false});
  }

  handleResumeClick() {
    this.setState({noRoleConfirmed: true});
    this.closeConfirmationDialog();
  }

  handleRoleIdsChange(value) {
    this.setState({
      noRoleConfirmed: false,
      roleIds: value,
    });
  }

  handleSaveClick(onSave, d) {
    const {roleIds, noRoleConfirmed} = this.state;
    if (roleIds.length > 0 || noRoleConfirmed) {
      return onSave(d);
    }
    this.setState({confirmationDialogVisible: true});
  }

  render() {
    const {
      accessHosts = '',
      accessIfaces = '',
      capabilities,
      comment = '',
      groups,
      groupIds = [],
      hostsAllow = ACCESS_ALLOW_ALL,
      ifacesAllow = ACCESS_ALLOW_ALL,
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

    const {confirmationDialogVisible, roleIds} = this.state;

    const isEdit = isDefined(user);

    const data = {
      ...user,
      access_hosts: accessHosts,
      access_ifaces: accessIfaces,
      auth_method:
        isEdit && isDefined(user.authMethod)
          ? user.authMethod
          : AUTH_METHOD_PASSWORD,
      comment,
      group_ids: groupIds,
      groups,
      hosts_allow: hostsAllow,
      ifaces_allow: ifacesAllow,
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
          onSave={d => this.handleSaveClick(onSave, d)}
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

                <FormGroup title={_('Interface Access')}>
                  <Divider flex="column">
                    <Divider>
                      <Radio
                        name="ifaces_allow"
                        title={_('Allow all and deny')}
                        value={ACCESS_ALLOW_ALL}
                        checked={state.ifaces_allow === ACCESS_ALLOW_ALL}
                        onChange={onValueChange}
                      />
                      <Radio
                        name="ifaces_allow"
                        title={_('Deny all and allow')}
                        value={ACCESS_DENY_ALL}
                        checked={state.ifaces_allow === ACCESS_DENY_ALL}
                        onChange={onValueChange}
                      />
                    </Divider>
                    <TextField
                      name="access_ifaces"
                      size="30"
                      value={state.access_ifaces}
                      onChange={onValueChange}
                    />
                  </Divider>
                </FormGroup>
              </Layout>
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
  accessIfaces: PropTypes.string,
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
  ifacesAllow: PropTypes.oneOf([ACCESS_ALLOW_ALL, ACCESS_DENY_ALL]),
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

export default withCapabilities(Dialog);

// vim: set ts=2 sw=2 tw=80:
