/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type default as Credential,
  type ActiveDirectoryTlsMode,
} from 'gmp/models/credential';
import useTranslation from 'web/hooks/useTranslation';

export const connectionServer = (credential: Credential) => {
  if (!credential.adHost) return undefined;
  const host =
    credential.adHost.includes(':') && !credential.adHost.startsWith('[')
      ? `[${credential.adHost}]`
      : credential.adHost;
  return credential.adPort ? `${host}:${credential.adPort}` : host;
};

export const useTlsModeLabel = () => {
  const [_] = useTranslation();
  return (mode?: ActiveDirectoryTlsMode) => {
    switch (mode) {
      case 'ldaps':
        return _('LDAPS');
      case 'starttls':
        return _('StartTLS');
      default:
        return _('Unavailable');
    }
  };
};
