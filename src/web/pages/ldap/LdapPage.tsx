/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useState} from 'react';
import {type CertificateInfo} from 'gmp/commands/user';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import {EditIcon, LdapIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Loading from 'web/components/loading/Loading';
import Section from 'web/components/section/Section';
import Table from 'web/components/table/SimpleTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import LdapDialog, {type LdapDialogState} from 'web/pages/ldap/LdapDialog';
import {renderYesNo} from 'web/utils/Render';

interface ToolBarIconsProps {
  onOpenDialogClick: () => void;
}

interface LdapSettings {
  authdn?: string;
  certificateInfo?: CertificateInfo;
  enabled?: boolean;
  ldaphost?: string;
  ldapsOnly?: boolean;
}

const ToolBarIcons = ({onOpenDialogClick}: ToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="ldap"
        page="web-interface-access"
        size="small"
        title={_('Help: LDAP per-User Authentication')}
      />
      <EditIcon
        title={_('Edit LDAP per-User Authentication')}
        onClick={onOpenDialogClick}
      />
    </IconDivider>
  );
};

const LdapAuthentication = () => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [hasLdapSupport, setHasLdapSupport] = useState(true);
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(true);
  const [authdn, setAuthdn] = useState('');
  const [certificateInfo, setCertificateInfo] = useState<
    CertificateInfo | undefined
  >();
  const [ldapEnabled, setLdapEnabled] = useState(false);
  const [ldapHost, setLdapHost] = useState('');
  const [ldapsOnly, setLdapsOnly] = useState(false);

  const loadLdapAuthSettings = useCallback(async () => {
    setLoading(true);

    try {
      const response = await gmp.user.currentAuthSettings();
      const {data: settings} = response;
      // ldap support is enabled in gvm-libs
      const hasLdapSupport = settings.has('method:ldap_connect');
      const ldapSettings = settings.get('method:ldap_connect') as LdapSettings;
      setHasLdapSupport(hasLdapSupport);
      setInitial(false);
      setAuthdn(ldapSettings.authdn || '');
      setCertificateInfo(ldapSettings.certificateInfo);
      setLdapEnabled(ldapSettings.enabled || false);
      setLdapHost(ldapSettings.ldaphost || '');
      setLdapsOnly(ldapSettings.ldapsOnly || false);
    } finally {
      setLoading(false);
    }
  }, [gmp.user]);

  const handleSaveSettings = async ({
    authdn,
    certificate,
    ldapEnabled,
    ldapHost,
    ldapsOnly,
  }: LdapDialogState) => {
    await gmp.auth.saveLdap({
      authdn,
      certificate,
      ldapEnabled,
      ldapHost,
      ldapsOnly,
    });
    await loadLdapAuthSettings();
    closeDialog();
  };

  const openDialog = () => {
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  useEffect(() => {
    void loadLdapAuthSettings();
  }, [loadLdapAuthSettings]);

  if (loading && initial) {
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
              <TableCol width="10%" />
              <TableCol width="90%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Enabled')}</TableData>
                <TableData>{renderYesNo(ldapEnabled)}</TableData>
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
                <TableData>{_('Use LDAPS only')}</TableData>
                <TableData>{renderYesNo(ldapsOnly)}</TableData>
              </TableRow>
              {isDefined(certificateInfo) && (
                <>
                  <TableRow>
                    <TableData>{_('Activation')}</TableData>
                    <TableData>
                      <DateTime date={certificateInfo.activationTime} />
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>{_('Expiration')}</TableData>
                    <TableData>
                      <DateTime date={certificateInfo.expirationTime} />
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>{_('MD5 Fingerprint')}</TableData>
                    <TableData>{certificateInfo.md5Fingerprint}</TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>{_('Issued by')}</TableData>
                    <TableData>{certificateInfo.issuer}</TableData>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        ) : (
          <p>{_('Support for LDAP is not available.')}</p>
        )}
      </Layout>

      {dialogVisible && (
        <LdapDialog
          authdn={authdn}
          ldapEnabled={ldapEnabled}
          ldapHost={ldapHost}
          ldapsOnly={ldapsOnly}
          onClose={closeDialog}
          onSave={handleSaveSettings}
        />
      )}
    </React.Fragment>
  );
};

export default LdapAuthentication;
