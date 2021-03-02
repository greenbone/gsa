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
import React, {useState, useCallback, useEffect} from 'react';

import _ from 'gmp/locale';

import EditIcon from 'web/components/icon/editicon';
import LdapIcon from 'web/components/icon/ldapicon';
import ManualIcon from 'web/components/icon/manualicon';

import Layout from 'web/components/layout/layout';
import IconDivider from 'web/components/layout/icondivider';
import Section from 'web/components/section/section';
import PageTitle from 'web/components/layout/pagetitle';

import Table from 'web/components/table/simpletable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import Loading from 'web/components/loading/loading';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import useGmp from 'web/utils/useGmp';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import LdapDialog from './dialog';

const ToolBarIcons = ({onOpenDialogClick}) => (
  <IconDivider>
    <ManualIcon
      page="web-interface-access"
      anchor="ldap"
      size="small"
      title={_('Help: LDAP per-User Authentication')}
    />
    <EditIcon
      onClick={onOpenDialogClick}
      title={_('Edit LDAP per-User Authentication')}
    />
  </IconDivider>
);

ToolBarIcons.propTypes = {
  onOpenDialogClick: PropTypes.func,
};

const LdapAuthentication = () => {
  const gmp = useGmp();
  const [, renewSessionTimeout] = useUserSessionTimeout();

  const [authdn, setAuthdn] = useState();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [isLdapEnabled, setIsLdapEnabled] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [hasLdapSupport, setHasLdapSupport] = useState(false);
  const [ldapHost, setLdapHost] = useState();
  const [certificateInfo, setCertificateInfo] = useState({});

  const loadLdapAuthSettings = useCallback(() => {
    setIsLoading(true);

    return gmp.user.currentAuthSettings().then(response => {
      const {data: settings} = response;
      // ldap support is enabled in gvm-libs
      // eslint-disable-next-line no-shadow
      const {authdn, certificateInfo, enabled, ldaphost} = settings.get(
        'method:ldap_connect',
      );

      setAuthdn(authdn);
      setCertificateInfo(certificateInfo ?? {});
      setHasLdapSupport(settings.has('method:ldap_connect'));
      setIsInitial(false);
      setIsLdapEnabled(enabled);
      setIsLoading(false);
      setLdapHost(ldaphost);
    });
  }, [gmp.user]);

  const openDialog = useCallback(() => {
    setDialogVisible(true);
    renewSessionTimeout();
  }, [renewSessionTimeout]);

  const closeDialog = useCallback(() => {
    setDialogVisible(false);
    renewSessionTimeout();
  }, [renewSessionTimeout]);

  const handleSaveSettings = useCallback(
    // eslint-disable-next-line no-shadow
    ({authdn, certificate, enable, ldaphost}) => {
      renewSessionTimeout();

      return gmp.auth
        .saveLdap({
          authdn,
          certificate,
          enable,
          ldaphost,
        })
        .then(() => {
          loadLdapAuthSettings();
          setDialogVisible(false);
        });
    },
    [gmp.auth, loadLdapAuthSettings, renewSessionTimeout],
  );

  useEffect(() => {
    // load ldap auth settings on mount
    loadLdapAuthSettings();
  }, [loadLdapAuthSettings]);

  if (isLoading && isInitial) {
    return <Loading />;
  }
  return (
    <React.Fragment>
      <PageTitle title={_('LDAP per-User Authentication')} />
      <Layout flex="column">
        {hasLdapSupport && <ToolBarIcons onOpenDialogClick={openDialog} />}
        <Section
          img={<LdapIcon size="large" />}
          title={_('LDAP per-User Authentication')}
        />
        {hasLdapSupport ? (
          <Table>
            <colgroup>
              <Col width="10%" />
              <Col width="90%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Enabled')}</TableData>
                <TableData>{renderYesNo(isLdapEnabled)}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('LDAP Host')}</TableData>
                <TableData>{ldapHost}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Auth. DN')}</TableData>
                <TableData>{authdn}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Activation')}</TableData>
                <TableData>{certificateInfo.activation_time}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Expiration')}</TableData>
                <TableData>{certificateInfo.expiration_time}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('MD5 Fingerprint')}</TableData>
                <TableData>{certificateInfo.md5_fingerprint}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Issued by')}</TableData>
                <TableData>{certificateInfo.issuer}</TableData>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <p>{_('Support for LDAP is not available.')}</p>
        )}
      </Layout>

      {dialogVisible && (
        <LdapDialog
          authdn={authdn}
          enable={isLdapEnabled}
          ldaphost={ldapHost}
          onClose={closeDialog}
          onSave={handleSaveSettings}
        />
      )}
    </React.Fragment>
  );
};

export default LdapAuthentication;

// vim: set ts=2 sw=2 tw=80:
