/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  showSuccessNotification,
  showErrorNotification,
} from '@greenbone/ui-lib';
import {isDefined} from 'gmp/utils/identity';
import {CredentialIcon, EditIcon} from 'web/components/icon';
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
import {
  useGetCredentialStores,
  useModifyCredentialStore,
  useVerifyCredentialStore,
} from 'web/hooks/use-query/credential-store';
import useTranslation from 'web/hooks/useTranslation';
import ConnectionStatusPill from 'web/pages/credential-store/ConnectionStatusPill';
import CredentialStoreDialog, {
  type CredentialStoreDialogState,
} from 'web/pages/credential-store/CredentialStoreDialog';
import {renderYesNo} from 'web/utils/Render';

interface ToolBarIconsProps {
  onOpenDialogClick: () => void;
  onTestConnectionClick: () => void;
  connectionStatus: 'success' | 'failed' | 'testing' | undefined;
}

const ToolBarIcons = ({
  onOpenDialogClick,
  onTestConnectionClick,
  connectionStatus,
}: ToolBarIconsProps) => {
  const [_] = useTranslation();

  return (
    <IconDivider>
      <ManualIcon
        anchor="ldap"
        page="web-interface-access"
        size="small"
        title={_('Help: Credential Store')}
      />
      <EditIcon
        title={_('Edit Credential Store')}
        onClick={onOpenDialogClick}
      />
      <ConnectionStatusPill
        status={connectionStatus}
        onClick={onTestConnectionClick}
      />
    </IconDivider>
  );
};

const CredentialStorePage = () => {
  const [_] = useTranslation();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'success' | 'failed' | 'testing' | undefined
  >(undefined);

  const {
    data: credentialStoresData,
    isLoading,
    error,
    isError,
  } = useGetCredentialStores({});

  const credentialStore = credentialStoresData?.entities?.[0];

  const verifyCredentialStore = useVerifyCredentialStore({});

  const modifyCredentialStore = useModifyCredentialStore({});

  const handleSaveSettings = async ({
    active,
    appId,
    comment,
    host,
    path,
    port,
    clientCertificate,
    clientKey,
    pkcs12File,
    passphrase,
    serverCaCertificate,
  }: CredentialStoreDialogState): Promise<void> => {
    if (!credentialStore?.id) {
      return;
    }

    await modifyCredentialStore.mutateAsync({
      id: credentialStore.id,
      active,
      appId,
      comment,
      host,
      path,
      port,
      clientCertificate,
      clientKey,
      pkcs12File,
      passphrase,
      serverCaCertificate,
    });

    showSuccessNotification(
      _('Credential store settings saved successfully.'),
      _('Settings saved'),
    );
    closeDialog();
  };

  const openDialog = () => {
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const handleTestConnection = async () => {
    if (!credentialStore?.id) {
      showErrorNotification(
        _('No credential store found to verify.'),
        _('Connection failed'),
      );
      return;
    }

    try {
      setConnectionStatus('testing');
      if (!credentialStore?.getPreference?.('app_id')?.value) {
        showErrorNotification(
          _(
            'App ID is required to verify the credential store. Please set the App ID in the edit dialog.',
          ),
          _('Connection failed'),
        );
        setConnectionStatus('failed');
        return;
      }
      await verifyCredentialStore.mutateAsync({id: credentialStore.id});
      setConnectionStatus('success');
      showSuccessNotification(
        _('Connection to credential store server established successfully.'),
        _('Connection successful'),
      );
    } catch (error) {
      setConnectionStatus('failed');
      showErrorNotification(
        _(
          'Failed to connect to credential store server. Please check your settings.',
        ),
        _('Connection failed'),
      );
      console.error('Connection test failed:', error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Layout flex="column">
        <PageTitle title={_('Credential Store')} />
        <p>
          {_('Error loading credential store: ') +
            (error?.message || 'Unknown error')}
        </p>
      </Layout>
    );
  }

  const hasCredentialStore = isDefined(credentialStore);

  return (
    <>
      <PageTitle title={_('Credential Store')} />
      <Layout flex="column">
        {hasCredentialStore && (
          <ToolBarIcons
            connectionStatus={connectionStatus}
            onOpenDialogClick={openDialog}
            onTestConnectionClick={handleTestConnection}
          />
        )}

        {hasCredentialStore ? (
          <Section
            img={<CredentialIcon size="large" />}
            title={_('Credential Store')}
          >
            <Table>
              <colgroup>
                <TableCol width="20%" />
                <TableCol width="80%" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableData>{_('Name')}</TableData>
                  <TableData>{credentialStore.name ?? _('N/A')}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Active')}</TableData>
                  <TableData>
                    {renderYesNo(credentialStore.active ?? false)}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Host')}</TableData>
                  <TableData>{credentialStore.host ?? _('N/A')}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Path')}</TableData>
                  <TableData>{credentialStore.path ?? _('N/A')}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Port')}</TableData>
                  <TableData>{credentialStore.port ?? _('N/A')}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Version')}</TableData>
                  <TableData>{credentialStore.version ?? _('N/A')}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Comment')}</TableData>
                  <TableData>{credentialStore.comment ?? _('N/A')}</TableData>
                </TableRow>
              </TableBody>
            </Table>
          </Section>
        ) : (
          <p>{_('No credential store configured.')}</p>
        )}
      </Layout>

      {dialogVisible && (
        <CredentialStoreDialog
          active={credentialStore?.active === 1}
          appId={credentialStore?.getPreference?.('app_id')?.value}
          comment={credentialStore?.comment}
          host={credentialStore?.host}
          path={credentialStore?.path}
          port={credentialStore?.port}
          onClose={closeDialog}
          onSave={handleSaveSettings}
        />
      )}
    </>
  );
};

export default CredentialStorePage;
