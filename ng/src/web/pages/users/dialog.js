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

import React from 'react';

import _ from 'gmp/locale.js';
import {is_defined, map} from 'gmp/utils';

import {
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
  AUTH_METHOD_LDAP,
  AUTH_METHOD_NEW_PASSWORD,
  AUTH_METHOD_PASSWORD,
  AUTH_METHOD_RADIUS,
} from 'gmp/models/user.js';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import PasswordField from '../../components/form/passwordfield.js';
import Radio from '../../components/form/radio.js';
import MultiSelect from '../../components/form/multiselect.js';
import TextField from '../../components/form/textfield.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

class Dialog extends React.Component { // eslint-disable-line react/prefer-stateless-function

  render() {

    const {
      access_hosts = '',
      access_ifaces = '',
      auth_method = AUTH_METHOD_PASSWORD,
      comment = '',
      groups,
      group_ids = [],
      hosts_allow = ACCESS_ALLOW_ALL,
      ifaces_allow = ACCESS_ALLOW_ALL,
      name = _('Unnamed'),
      old_name,
      password,
      roles,
      role_ids = [],
      settings,
      title = _('New User'),
      user,
      visible = true,
      onClose,
      onSave,
    } = this.props;

    const data = {
      ...user,
      access_hosts,
      access_ifaces,
      auth_method,
      comment,
      group_ids,
      groups,
      hosts_allow,
      ifaces_allow,
      name,
      old_name,
      password,
      role_ids,
      roles,
    };

    const {capabilities} = this.context;
    const is_edit = is_defined(user);

    const rolesOptions = map(roles, role => ({
      label: role.name,
      value: role.id,
    }));

    const groupsOptions = map(groups, group => ({
      label: group.name,
      value: group.id,
    }));

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
          return (
            <Layout flex="column">

              <FormGroup title={_('Login Name')}>
                <TextField
                  name="name"
                  grow="1"
                  value={state.name}
                  size="30"
                  onChange={onValueChange}
                  maxLength="80"/>
              </FormGroup>

              <FormGroup title={_('Comment')}>
                <TextField
                  name="comment"
                  value={state.comment}
                  grow="1"
                  size="30" maxLength="400"
                  onChange={onValueChange}/>
              </FormGroup>

              {!is_edit &&
                <FormGroup
                  title={_('Authentication')}
                  flex="column">
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
                      value={state.password}
                      onChange={onValueChange}
                    />
                  </Divider>
                  {settings.get('method:ldap_connect').enable === 'true' &&
                    <Divider>
                      <Radio
                        title={_('LDAP Authentication Only')}
                        name="auth_method"
                        value={AUTH_METHOD_LDAP}
                        checked={state.auth_method === AUTH_METHOD_LDAP}
                        onChange={onValueChange}
                      />
                    </Divider>
                  }
                  {settings.get('method:radius_connect').enable === 'true' &&
                    <Divider>
                      <Radio
                        title={_('RADIUS Authentication Only')}
                        name="auth_method"
                        value={AUTH_METHOD_RADIUS}
                        checked={state.auth_method === AUTH_METHOD_RADIUS}
                        onChange={onValueChange}
                      />
                    </Divider>
                  }
                </FormGroup>
              }
              {is_edit &&
                <FormGroup
                  title={_('Authentication')}
                  flex="column">
                  <Divider>
                    <Radio
                      title={_('Password: Use existing Password')}
                      name="auth_method"
                      value={AUTH_METHOD_PASSWORD}
                      checked={state.auth_method === AUTH_METHOD_PASSWORD}
                      onChange={onValueChange}
                    />
                  </Divider>
                  <Divider>
                    <Radio
                      title={_('New Password')}
                      name="auth_method"
                      value={AUTH_METHOD_NEW_PASSWORD}
                      checked={state.auth_method === AUTH_METHOD_NEW_PASSWORD}
                      onChange={onValueChange}
                    />
                    <PasswordField
                      name="password"
                      value={state.password}
                      onChange={onValueChange}
                    />
                  </Divider>
                  {settings.get('method:ldap_connect').enable === 'true' &&
                    <Divider>
                      <Radio
                        title={_('LDAP Authentication Only')}
                        name="auth_method"
                        value={AUTH_METHOD_LDAP}
                        checked={state.auth_method === AUTH_METHOD_LDAP}
                        onChange={onValueChange}
                      />
                    </Divider>
                  }
                  {settings.get('method:radius_connect').enable === 'true' &&
                    <Divider>
                      <Radio
                        title={_('RADIUS Authentication Only')}
                        name="auth_method"
                        value={AUTH_METHOD_RADIUS}
                        checked={state.auth_method === AUTH_METHOD_RADIUS}
                        onChange={onValueChange}
                      />
                    </Divider>
                  }
                </FormGroup>
              }

              {capabilities.mayAccess('roles') &&
                <FormGroup
                  title={_('Roles')}>
                  <MultiSelect
                    name="role_ids"
                    items={rolesOptions}
                    value={state.role_ids}
                    onChange={onValueChange}
                  />
                </FormGroup>
              }

              {capabilities.mayAccess('groups') &&
                <FormGroup
                  title={_('Groups')}>
                  <MultiSelect
                    name="group_ids"
                    items={groupsOptions}
                    value={state.group_ids}
                    onChange={onValueChange}
                  />
                </FormGroup>
              }

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
                    maxLength="2000"
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
                    maxLength="2000"
                    value={state.access_ifaces}
                    onChange={onValueChange}
                  />
                </Divider>
              </FormGroup>

            </Layout>
          );
        }}
      </SaveDialog>
    );
  }
}

Dialog.propTypes = {
  access_hosts: PropTypes.string,
  access_ifaces: PropTypes.string,
  auth_method: PropTypes.oneOf([
    AUTH_METHOD_LDAP,
    AUTH_METHOD_NEW_PASSWORD,
    AUTH_METHOD_PASSWORD,
    AUTH_METHOD_RADIUS,
  ]),
  comment: PropTypes.string,
  group_ids: PropTypes.array,
  groups: PropTypes.array,
  hosts_allow: PropTypes.oneOf([
    ACCESS_ALLOW_ALL,
    ACCESS_DENY_ALL,
  ]),
  id: PropTypes.id,
  ifaces_allow: PropTypes.oneOf([
    ACCESS_ALLOW_ALL,
    ACCESS_DENY_ALL,
  ]),
  name: PropTypes.string,
  old_name: PropTypes.string,
  password: PropTypes.string,
  role_ids: PropTypes.array,
  roles: PropTypes.array,
  settings: PropTypes.settings.isRequired,
  title: PropTypes.string,
  user: PropTypes.model,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

Dialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
