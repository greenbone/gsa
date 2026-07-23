/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
  AUTH_METHOD_LDAP,
  AUTH_METHOD_RADIUS,
  type default as User,
} from 'gmp/models/user';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation, {type TranslateFunc} from 'web/hooks/useTranslation';

type UserHosts = NonNullable<User['hosts']>;

interface UserDetailsProps {
  entity: User;
  links?: boolean;
}

export const convert_auth_method = (
  authMethod: User['authMethod'],
  _: TranslateFunc,
) => {
  if (authMethod === AUTH_METHOD_LDAP) {
    return _('LDAP');
  }
  if (authMethod === AUTH_METHOD_RADIUS) {
    return _('RADIUS');
  }
  return _('Local');
};

export const convert_allow = (
  {addresses = [], allow}: Partial<UserHosts> = {},
  _: TranslateFunc,
) => {
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

const UserDetails = ({entity, links = true}: UserDetailsProps) => {
  const [_] = useTranslation();
  const {authMethod, comment, groups = [], hosts, roles = []} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <TableCol width="10%" />
          <TableCol width="90%" />
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
                {roles.map((role, index) => {
                  if (!role.id) {
                    return <span key={`role-${index}`}>{role.name}</span>;
                  }
                  return (
                    <span key={role.id}>
                      <DetailsLink id={role.id} textOnly={!links} type="role">
                        {role.name}
                      </DetailsLink>
                    </span>
                  );
                })}
              </HorizontalSep>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Groups')}</TableData>
            <TableData>
              <HorizontalSep>
                {groups.map((group, index) => {
                  if (!group.id) {
                    return <span key={`group-${index}`}>{group.name}</span>;
                  }
                  return (
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
                  );
                })}
              </HorizontalSep>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Host Access')}</TableData>
            <TableData>
              {convert_allow(hosts ?? {addresses: []}, _).replace(
                /&#x2F;/g,
                '/',
              )}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Authentication Type')}</TableData>
            <TableData>{convert_auth_method(authMethod, _)}</TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

export default UserDetails;
