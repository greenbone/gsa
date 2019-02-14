/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import {
  AUTH_METHOD_LDAP,
  AUTH_METHOD_RADIUS,
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
} from 'gmp/models/user';

import PropTypes from 'web/utils/proptypes';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

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
    if (addresses.length === 0) {
      return _('Allow all');
    }
    return _('Allow all and deny from {{addresses}}', {
      addresses: addresses.join(', '),
    });
  }
  if (allow === ACCESS_DENY_ALL) {
    if (addresses.length === 0) {
      return _('Deny all');
    }
    return _('Deny all and allow from {{addresses}}', {
      addresses: addresses.join(', '),
    });
  }
  return '';
};

const UserDetails = ({entity, links = true}) => {
  const {
    auth_method,
    comment,
    groups = [],
    hosts = {},
    ifaces = [],
    roles = [],
  } = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Roles')}</TableData>
            <TableData>
              <Divider>
                {roles.map(role => (
                  <DetailsLink
                    textOnly={!links}
                    key={role.id}
                    type="role"
                    id={role.id}
                  >
                    {role.name}
                  </DetailsLink>
                ))}
              </Divider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Groups')}</TableData>
            <TableData>
              <Divider>
                {groups.map(group => (
                  <DetailsLink
                    textOnly={!links}
                    type="group"
                    key={group.id}
                    id={group.id}
                  >
                    {group.name}
                  </DetailsLink>
                ))}
              </Divider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Host Access')}</TableData>
            <TableData>{convert_allow(hosts)}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Interface Access')}</TableData>
            <TableData>{convert_allow(ifaces)}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Authentication Type')}</TableData>
            <TableData>{convert_auth_method(auth_method)}</TableData>
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
