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
import React from 'react';

import _ from 'gmp/locale';

import {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
} from 'gmp/models/credential';

import DownloadExeIcon from 'web/components/icon/downloadexeicon';
import DownloadDebIcon from 'web/components/icon/downloaddebicon';
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
      {type === CLIENT_CERTIFICATE_CREDENTIAL_TYPE && (
        <DownloadKeyIcon
          title={_('Download Certificate (.pem)')}
          value={credential}
          onClick={cred => onDownload(cred, 'pem')}
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
