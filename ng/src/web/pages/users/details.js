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

import _ from 'gmp/locale.js';
import {is_empty} from 'gmp/utils.js';

import {
  AUTH_METHOD_LDAP,
  AUTH_METHOD_RADIUS,
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
} from 'gmp/models/user.js';

import PropTypes from '../../utils/proptypes.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

export const convert_auth_method = auth_method => {
  if (auth_method === AUTH_METHOD_LDAP) {
    return _('LDAP');
  }
  if (auth_method === AUTH_METHOD_RADIUS) {
    return _('RADIUS');
  }
  return _('Local');
};

export const convert_allow = ({addresses, allow}) => {
  if (allow === ACCESS_ALLOW_ALL) {
    if (is_empty(addresses)) {
      return _('Allow all');
    }
    return _('Allow all and deny from {{addresses}}', {addresses});
  }
  if (allow === ACCESS_DENY_ALL) {
    if (is_empty(addresses)) {
      return _('Deny all');
    }
    return _('Deny all and allow from {{addresses}}', {addresses});
  }
  return '';
};

const UserDetails = ({
  entity,
  links = true,
}) => {
  const {
    auth_method,
    comment,
    groups = [],
    hosts = {},
    ifaces = [],
    roles = [],
  } = entity;
  return (
    <Layout
      grow
      flex="column"
    >
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('Comment')}
            </TableData>
            <TableData>
              {comment}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Roles')}
            </TableData>
            <TableData>
              <Divider>
                {roles.map(role => (
                  <DetailsLink
                    textOnly={!links}
                    key={role.id}
                    type="role"
                    id={role.id}>
                    {role.name}
                  </DetailsLink>
                ))}
              </Divider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Groups')}
            </TableData>
            <TableData>
              <Divider>
                {groups.map(group => (
                  <DetailsLink
                    textOnly={!links}
                    type="group"
                    key={group.id}
                    id={group.id}>
                    {group.name}
                  </DetailsLink>
                ))}
              </Divider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Host Access')}
            </TableData>
            <TableData>
              {convert_allow(hosts)}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Interface Access')}
            </TableData>
            <TableData>
              {convert_allow(ifaces)}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Authentication Type')}
            </TableData>
            <TableData>
              {convert_auth_method(auth_method)}
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

UserDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default UserDetails;

// vim: set ts=2 sw=2 tw=80:
