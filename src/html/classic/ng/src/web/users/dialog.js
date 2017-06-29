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

import PropTypes from '../utils/proptypes.js';

import {withDialog} from '../components/dialog/dialog.js';

import FormGroup from '../components/form/formgroup.js';
import PasswordField from '../components/form/passwordfield.js';
import Radio from '../components/form/radio.js';
import Select2 from '../components/form/select2.js';
import TextField from '../components/form/textfield.js';

import Layout from '../components/layout/layout.js';

class Dialog extends React.Component {

  render() {
    const {
      id,
      access_ifaces,
      access_hosts,
      auth_method,
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

        {!is_edit &&
          <FormGroup
            title={_('Authentication')}
            flex="column">
            <Layout flex box>
              <Radio
                title={_('Password')}
                name="auth_method"
                value="0"
                checked={auth_method === "0"}
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
                  value="1"
                  checked={auth_method === "1"}
                  onChange={onValueChange}
                />
              </Layout>
            }
            {settings.get('method:radius_connect').enable === 'true' &&
              <Layout flex box>
                <Radio
                  title={_('RADIUS Authentication Only')}
                  name="auth_method"
                  value="2"
                  checked={auth_method === "2"}
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
                value="0"
                checked={auth_method === "0"}
                onChange={onValueChange}
              />
            </Layout>
            <Layout flex box>
              <Radio
                title={_('New Password')}
                name="auth_method"
                value="1"
                checked={auth_method === "1"}
                onChange={onValueChange}
              />
              <PasswordField
                name="password"
                value={password}
                onChange={onValueChange}
              />
            </Layout>
            <Layout flex box>
              <Radio
                title={_('LDAP Authentication Only')}
                name="auth_method"
                value="2"
                checked={auth_method === "2"}
                onChange={onValueChange}
              />
            </Layout>
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
              value="0"
              checked={hosts_allow === "0"}
              onChange={onValueChange}
            />
            <Radio
              name="hosts_allow"
              title={_('Deny all and allow')}
              value="1"
              checked={hosts_allow === "1"}
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
              value="0"
              checked={ifaces_allow === "0"}
              onChange={onValueChange}
            />
            <Radio
              name="ifaces_allow"
              title={_('Deny all and allow')}
              value="1"
              checked={ifaces_allow === "1"}
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
  auth_method: PropTypes.oneOf(['0', '1']).isRequired,
  group_ids: PropTypes.array,
  groups: PropTypes.arrayLike,
  hosts_allow: PropTypes.oneOf(['0', '1']).isRequired,
  id: PropTypes.id,
  ifaces_allow: PropTypes.oneOf(['0', '1']).isRequired,
  name: PropTypes.string,
  password: PropTypes.string,
  role_ids: PropTypes.array,
  roles: PropTypes.arrayLike,
  settings: PropTypes.settings.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

Dialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withDialog(Dialog, {
  title: _('New User'),
  footer: _('Save'),
  defaultState: {
    access_hosts: '',
    access_ifaces: '',
    auth_method: '0',
    group_ids: [],
    hosts_allow: '0',
    ifaces_allow: '0',
    name: _('Unnamed'),
    role_ids: [],
  },
});

// vim: set ts=2 sw=2 tw=80:
