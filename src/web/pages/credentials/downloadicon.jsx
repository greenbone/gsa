/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import React from 'react';
import DownloadDebIcon from 'web/components/icon/downloaddebicon';
import DownloadExeIcon from 'web/components/icon/downloadexeicon';
import DownloadKeyIcon from 'web/components/icon/downloadkeyicon';
import DownloadRpmIcon from 'web/components/icon/downloadrpmicon';
import IconDivider from 'web/components/layout/icondivider';
import PropTypes from 'web/utils/proptypes';

const CredentialDownloadIcon = ({credential, onDownload}) => {
  const type = credential.credential_type;
  return (
    <IconDivider align={['center', 'center']}>
      {type === USERNAME_SSH_KEY_CREDENTIAL_TYPE && (
        <DownloadRpmIcon
          title={_('Download RPM (.rpm) Package')}
          value={credential}
          onClick={cred => onDownload(cred, 'rpm')}
        />
      )}
      {type === USERNAME_SSH_KEY_CREDENTIAL_TYPE && (
        <DownloadDebIcon
          title={_('Download Debian (.deb) Package')}
          value={credential}
          onClick={cred => onDownload(cred, 'deb')}
        />
      )}
      {type === USERNAME_SSH_KEY_CREDENTIAL_TYPE && (
        <DownloadKeyIcon
          title={_('Download Public Key')}
          value={credential}
          onClick={cred => onDownload(cred, 'key')}
        />
      )}
      {type === USERNAME_PASSWORD_CREDENTIAL_TYPE && (
        <DownloadExeIcon
          title={_('Download Windows Executable (.exe)')}
          value={credential}
          onClick={cred => onDownload(cred, 'exe')}
        />
      )}
    </IconDivider>
  );
};

CredentialDownloadIcon.propTypes = {
  credential: PropTypes.model.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default CredentialDownloadIcon;

// vim: set ts=2 sw=2 tw=80:
