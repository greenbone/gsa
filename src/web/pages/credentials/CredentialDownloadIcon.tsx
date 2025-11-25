/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CredentialDownloadFormat} from 'gmp/commands/credential';
import {
  type default as Credential,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import {isDefined} from 'gmp/utils/identity';
import {
  DownloadDebIcon,
  DownloadExeIcon,
  DownloadKeyIcon,
  DownloadRpmIcon,
} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import useTranslation from 'web/hooks/useTranslation';

interface CredentialDownloadIconProps {
  credential: Credential;
  onDownload?: (
    credential: Credential,
    format: CredentialDownloadFormat,
  ) => void;
}

const CredentialDownloadIcon = ({
  credential,
  onDownload,
}: CredentialDownloadIconProps) => {
  const [_] = useTranslation();
  const type = credential.credentialType;
  return (
    <IconDivider align={['center', 'center']}>
      {type === USERNAME_SSH_KEY_CREDENTIAL_TYPE && (
        <DownloadRpmIcon
          title={_('Download RPM (.rpm) Package')}
          value={credential}
          onClick={
            isDefined(onDownload) ? cred => onDownload(cred, 'rpm') : undefined
          }
        />
      )}
      {type === USERNAME_SSH_KEY_CREDENTIAL_TYPE && (
        <DownloadDebIcon
          title={_('Download Debian (.deb) Package')}
          value={credential}
          onClick={
            isDefined(onDownload) ? cred => onDownload(cred, 'deb') : undefined
          }
        />
      )}
      {type === USERNAME_SSH_KEY_CREDENTIAL_TYPE && (
        <DownloadKeyIcon
          title={_('Download Public Key')}
          value={credential}
          onClick={
            isDefined(onDownload) ? cred => onDownload(cred, 'key') : undefined
          }
        />
      )}
      {type === USERNAME_PASSWORD_CREDENTIAL_TYPE && (
        <DownloadExeIcon
          title={_('Download Windows Executable (.exe)')}
          value={credential}
          onClick={
            isDefined(onDownload) ? cred => onDownload(cred, 'exe') : undefined
          }
        />
      )}
    </IconDivider>
  );
};

export default CredentialDownloadIcon;
