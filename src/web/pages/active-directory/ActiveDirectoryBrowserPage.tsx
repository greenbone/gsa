/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import {useParams} from 'react-router';
import styled from 'styled-components';
import ErrorMessage from 'web/components/error/ErrorMessage';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Button from 'web/components/form/Button';
import {ActiveDirectoryIcon} from 'web/components/icon';
import Column from 'web/components/layout/Column';
import PageTitle from 'web/components/layout/PageTitle';
import Row from 'web/components/layout/Row';
import Loading from 'web/components/loading/Loading';
import {EntityInfoTable} from 'web/entity/EntityInfo';
import {useGetActiveDirectoryCredential} from 'web/hooks/use-query/active-directory';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useTranslation from 'web/hooks/useTranslation';
import DirectoryBrowser from 'web/pages/active-directory/DirectoryBrowser';
import {BrowserViewport} from 'web/pages/active-directory/DirectoryLayout';
import {
  connectionServer,
  useTlsModeLabel,
} from 'web/pages/active-directory/useConnectionFormat';
import TargetComponent from 'web/pages/targets/TargetComponent';
import {mayAccessActiveDirectory} from 'web/utils/active-directory-access';

const ConnectionHeading = styled.h2`
  margin: 0;
  min-inline-size: 0;
  overflow-wrap: anywhere;
`;

const ConnectionMetadata = styled(EntityInfoTable)`
  color: inherit;
  font-size: var(--mantine-font-size-sm);

  tr {
    margin: 0 var(--mantine-spacing-lg) var(--mantine-spacing-xxs) 0;
    max-width: calc(100% - var(--mantine-spacing-lg));
  }

  th {
    text-align: start;
    vertical-align: top;
    font-weight: 600;
    padding-inline-end: var(--mantine-spacing-xs);
  }

  th,
  td {
    overflow-wrap: anywhere;
  }
`;

const ConnectionHeader = styled(Column)`
  border-block-end: 1px solid var(--mantine-color-default-border);

  > :first-child > :first-child {
    flex-shrink: 0;
  }
`;

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
        <BrowserViewport
          aria-labelledby="active-directory-connection-heading"
          className="active-directory-discovery"
          gap="md"
          role="region"
        >
          <ConnectionHeader gap="xs" pb="xs">
            <Row gap="xs">
              <ActiveDirectoryIcon
                aria-hidden="true"
                color="currentColor"
                size="medium"
              />
              <ConnectionHeading id="active-directory-connection-heading">
                {credential.name ?? _('Active Directory')}
              </ConnectionHeading>
            </Row>
            <ConnectionMetadata data-testid="entity-info">
              <tbody>
                {[
                  [
                    _('Server'),
                    connectionServer(credential) ?? _('Unavailable'),
                  ],
                  [_('Search base'), credential.adBaseDn || _('Unavailable')],
                  [_('TLS mode'), tlsModeLabel(credential.adTlsMode)],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </ConnectionMetadata>
          </ConnectionHeader>
          {targetError && <ErrorPanel message={targetError} />}
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
                  create({
                    hosts,
                    source: 'active_directory',
                    targetSource: 'manual',
                  });
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

  if (!mayAccessActiveDirectory(capabilities, features)) {
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
