/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import  _ from 'gmp/locale.js';
import {is_defined, map} from 'gmp/utils.js';

import {
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
  AUTH_METHOD_LDAP,
  AUTH_METHOD_NEW_PASSWORD,
  AUTH_METHOD_PASSWORD,
  AUTH_METHOD_RADIUS,
} from 'gmp/models/user.js';

import PropTypes from '../../utils/proptypes.js';

import withDialog from '../../components/dialog/withDialog.js';

import FormGroup from '../../components/form/formgroup.js';
import PasswordField from '../../components/form/passwordfield.js';
import Radio from '../../components/form/radio.js';
import Select2 from '../../components/form/select2.js';
import TextField from '../../components/form/textfield.js';

import Layout from '../../components/layout/layout.js';

class Dialog extends React.Component {

  render() {
    const {
      id,
      access_ifaces = '',
      access_hosts = '',
      auth_method,
      comment,
      groups,
      group_ids,
      hosts_allow,
      ifaces_allow,
      name,
      password,
      roles,
      role_ids,
      settings,
      onValueChange,
    } = this.props;
    const {capabilities} = this.context;
    const is_edit = is_defined(id);

    return (
      <Layout flex="column">

        <FormGroup title={_('Login Name')}>
          <TextField
            name="name"
            grow="1"
            value={name}
            size="30"
            onChange={onValueChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')}>
          <TextField
            name="comment"
            value={comment}
            grow="1"
            size="30" maxLength="400"
            onChange={onValueChange}/>
        </FormGroup>

        {!is_edit &&
          <FormGroup
            title={_('Authentication')}
            flex="column">
            <Layout flex box>
              <Radio
                title={_('Password')}
                name="auth_method"
                value={AUTH_METHOD_PASSWORD}
                checked={auth_method === AUTH_METHOD_PASSWORD}
                onChange={onValueChange}
              />
              <PasswordField
                name="password"
                value={password}
                onChange={onValueChange}
              />
            </Layout>
            {settings.get('method:ldap_connect').enable === 'true' &&
              <Layout flex box>
                <Radio
                  title={_('LDAP Authentication Only')}
                  name="auth_method"
                  value={AUTH_METHOD_LDAP}
                  checked={auth_method === AUTH_METHOD_LDAP}
                  onChange={onValueChange}
                />
              </Layout>
            }
            {settings.get('method:radius_connect').enable === 'true' &&
              <Layout flex box>
                <Radio
                  title={_('RADIUS Authentication Only')}
                  name="auth_method"
                  value={AUTH_METHOD_RADIUS}
                  checked={auth_method === AUTH_METHOD_RADIUS}
                  onChange={onValueChange}
                />
              </Layout>
            }
          </FormGroup>
        }
        {is_edit &&
          <FormGroup
            title={_('Authentication')}
            flex="column">
            <Layout flex box>
              <Radio
                title={_('Password: Use existing Password')}
                name="auth_method"
                value={AUTH_METHOD_PASSWORD}
                checked={auth_method === AUTH_METHOD_PASSWORD}
                onChange={onValueChange}
              />
            </Layout>
            <Layout flex box>
              <Radio
                title={_('New Password')}
                name="auth_method"
                value={AUTH_METHOD_NEW_PASSWORD}
                checked={auth_method === AUTH_METHOD_NEW_PASSWORD}
                onChange={onValueChange}
              />
              <PasswordField
                name="password"
                value={password}
                onChange={onValueChange}
              />
            </Layout>
            {settings.get('method:ldap_connect').enable === 'true' &&
              <Layout flex box>
                <Radio
                  title={_('LDAP Authentication Only')}
                  name="auth_method"
                  value={AUTH_METHOD_LDAP}
                  checked={auth_method === AUTH_METHOD_LDAP}
                  onChange={onValueChange}
                />
              </Layout>
            }
            {settings.get('method:radius_connect').enable === 'true' &&
              <Layout flex box>
                <Radio
                  title={_('RADIUS Authentication Only')}
                  name="auth_method"
                  value={AUTH_METHOD_RADIUS}
                  checked={auth_method === AUTH_METHOD_RADIUS}
                  onChange={onValueChange}
                />
              </Layout>
            }
          </FormGroup>
        }

        {capabilities.mayAccess('roles') &&
          <FormGroup
            title={_('Roles')}>
            <Select2
              multiple
              name="role_ids"
              value={role_ids}
              onChange={onValueChange}
            >
              {
                map(roles, role => {
                  return (
                    <option
                      key={role.id}
                      value={role.id}>
                      {role.name}
                    </option>
                  );
                })
              }
            </Select2>
          </FormGroup>
        }

        {capabilities.mayAccess('groups') &&
          <FormGroup
            title={_('Groups')}>
            <Select2
              multiple
              name="group_ids"
              value={group_ids}
              onChange={onValueChange}
            >
              {
                map(groups, group => {
                  return (
                    <option
                      key={group.id}
                      value={group.id}>
                      {group.name}
                    </option>
                  );
                })
              }
            </Select2>
          </FormGroup>
        }

        <FormGroup
          title={_('Host Access')}
          flex="column">
          <Layout flex box>
            <Radio
              name="hosts_allow"
              title={_('Allow all and deny')}
              value={ACCESS_ALLOW_ALL}
              checked={hosts_allow === ACCESS_ALLOW_ALL}
              onChange={onValueChange}
            />
            <Radio
              name="hosts_allow"
              title={_('Deny all and allow')}
              value={ACCESS_DENY_ALL}
              checked={hosts_allow === ACCESS_DENY_ALL}
              onChange={onValueChange}
            />
          </Layout>
          <Layout flex box>
            <TextField
              name="access_hosts"
              size="30"
              maxLength="2000"
              value={access_hosts}
              onChange={onValueChange}
            />
          </Layout>
        </FormGroup>

        <FormGroup
          title={_('Interface Access')}
          flex="column">
          <Layout flex box>
            <Radio
              name="ifaces_allow"
              title={_('Allow all and deny')}
              value={ACCESS_ALLOW_ALL}
              checked={ifaces_allow === ACCESS_ALLOW_ALL}
              onChange={onValueChange}
            />
            <Radio
              name="ifaces_allow"
              title={_('Deny all and allow')}
              value={ACCESS_DENY_ALL}
              checked={ifaces_allow === ACCESS_DENY_ALL}
              onChange={onValueChange}
            />
          </Layout>
          <Layout flex box>
            <TextField
              name="access_ifaces"
              size="30"
              maxLength="2000"
              value={access_ifaces}
              onChange={onValueChange}
            />
          </Layout>
        </FormGroup>

      </Layout>
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
  ]).isRequired,
  comment: PropTypes.string,
  group_ids: PropTypes.array,
  groups: PropTypes.arrayLike,
  hosts_allow: PropTypes.oneOf([
    ACCESS_ALLOW_ALL,
    ACCESS_DENY_ALL,
  ]).isRequired,
  id: PropTypes.id,
  ifaces_allow: PropTypes.oneOf([
    ACCESS_ALLOW_ALL,
    ACCESS_DENY_ALL,
  ]).isRequired,
  name: PropTypes.string,
  old_name: PropTypes.string,
  password: PropTypes.string,
  role_ids: PropTypes.array,
  roles: PropTypes.arrayLike,
  settings: PropTypes.settings.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

Dialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withDialog({
  title: _('New User'),
  footer: _('Save'),
  defaultState: {
    access_hosts: '',
    access_ifaces: '',
    auth_method: AUTH_METHOD_PASSWORD,
    comment: '',
    group_ids: [],
    hosts_allow: ACCESS_ALLOW_ALL,
    ifaces_allow: ACCESS_ALLOW_ALL,
    name: _('Unnamed'),
    role_ids: [],
  },
})(Dialog);

// vim: set ts=2 sw=2 tw=80:
