/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import {useParams} from 'react-router';
import ErrorMessage from 'web/components/error/ErrorMessage';
import Button from 'web/components/form/Button';
import {ActiveDirectoryIcon} from 'web/components/icon';
import Column from 'web/components/layout/Column';
import PageTitle from 'web/components/layout/PageTitle';
import Loading from 'web/components/loading/Loading';
import InlineNotification from 'web/components/notification/InlineNotification';
import SectionHeader from 'web/components/section/SectionHeader';
import TableBody from 'web/components/table/TableBody';
import TableRow from 'web/components/table/TableRow';
import {EntityInfoTable} from 'web/entity/EntityInfo';
import {useGetActiveDirectoryCredential} from 'web/hooks/use-query/active-directory';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useTranslation from 'web/hooks/useTranslation';
import {
  connectionServer,
  useTlsModeLabel,
} from 'web/pages/active-directory/ConnectionContext';
import DirectoryBrowser from 'web/pages/active-directory/DirectoryBrowser';
import {BrowserViewport} from 'web/pages/active-directory/DirectoryLayout';
import TargetComponent from 'web/pages/targets/TargetComponent';

const BrowserContent = ({credentialId}: {credentialId: string}) => {
  const [_] = useTranslation();
  const tlsModeLabel = useTlsModeLabel();
  const {
    data: credential,
    isFetching,
    isError,
    refetch,
  } = useGetActiveDirectoryCredential(credentialId);
  const [targetError, setTargetError] = useState<string>();
  return (
    <>
      <PageTitle title={credential?.name ?? _('Active Directory')} />
      {isFetching && <Loading />}
      {isError && (
        <ErrorMessage
          flex="column"
          message={_(
            'Could not load this Active Directory credential. It may have been deleted, be inaccessible, or have a different type.',
          )}
          role="alert"
        >
          <Button
            title={_('Retry credential')}
            onClick={() => void refetch()}
          />
        </ErrorMessage>
      )}
      {!isFetching && !isError && credential && (
        <BrowserViewport gap="xs" h="100%" mih="32rem">
          <Column flex={1} gap={0} mih={0}>
            <SectionHeader
              img={<ActiveDirectoryIcon size="large" />}
              title={credential.name ?? _('Active Directory')}
            />
            <Column flex={1} gap="xs" mih={0}>
              <Column gap={0} miw={0} style={{overflowX: 'auto'}}>
                <EntityInfoTable data-testid="entity-info">
                  <TableBody>
                    {[
                      [
                        _('Server'),
                        connectionServer(credential) ?? _('Unavailable'),
                      ],
                      [
                        _('Search base'),
                        credential.adBaseDn || _('Unavailable'),
                      ],
                      [_('TLS mode'), tlsModeLabel(credential.adTlsMode)],
                    ].map(([label, value]) => (
                      <TableRow key={label}>
                        <td>{label}:</td>
                        <td>{value}</td>
                      </TableRow>
                    ))}
                  </TableBody>
                </EntityInfoTable>
              </Column>
              {targetError && (
                <InlineNotification message={targetError} severity="error" />
              )}
              <TargetComponent
                onCreateError={error => setTargetError(error.message)}
                onCreated={() =>
                  showSuccessNotification('', _('Target created successfully.'))
                }
              >
                {({create}) => (
                  <DirectoryBrowser
                    key={credentialId}
                    sourceId={credentialId}
                    onApply={hosts => {
                      setTargetError(undefined);
                      create({hosts, targetSource: 'manual'});
                      showSuccessNotification(
                        '',
                        _('{{count}} hosts transferred to New Target.', {
                          count: hosts.length,
                        }),
                      );
                    }}
                  />
                )}
              </TargetComponent>
            </Column>
          </Column>
        </BrowserViewport>
      )}
    </>
  );
};

const ActiveDirectoryBrowserPage = () => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const features = useFeatures();
  const {credentialId} = useParams<{credentialId: string}>();

  if (
    !features.featureEnabled('ENABLE_AD_INTEGRATION') ||
    !capabilities.mayAccess('target')
  ) {
    return (
      <ErrorMessage
        message={_('Active Directory is not available.')}
        role="alert"
      />
    );
  }

  return (
    <BrowserContent key={credentialId} credentialId={credentialId ?? ''} />
  );
};

export default ActiveDirectoryBrowserPage;
