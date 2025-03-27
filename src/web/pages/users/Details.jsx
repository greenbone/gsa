/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {
  AUTH_METHOD_LDAP,
  AUTH_METHOD_RADIUS,
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
} from 'gmp/models/user';
import React from 'react';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import PropTypes from 'web/utils/PropTypes';

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
  const {authMethod, comment, groups = [], hosts = {}, roles = []} = entity;
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
              <HorizontalSep>
                {roles.map(role => (
                  <span key={role.id}>
                    <DetailsLink id={role.id} textOnly={!links} type="role">
                      {role.name}
                    </DetailsLink>
                  </span>
                ))}
              </HorizontalSep>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Groups')}</TableData>
            <TableData>
              <HorizontalSep>
                {groups.map(group => (
                  <span key={group.id}>
                    <DetailsLink
                      key={group.id}
                      id={group.id}
                      textOnly={!links}
                      type="group"
                    >
                      {group.name}
                    </DetailsLink>
                  </span>
                ))}
              </HorizontalSep>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Host Access')}</TableData>
            <TableData>
              {convert_allow(hosts).replace(/&#x2F;/g, '/')}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Authentication Type')}</TableData>
            <TableData>{convert_auth_method(authMethod)}</TableData>
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
