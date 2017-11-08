/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import Icon from '../../components/icon/icon.js';

import LegacyLink from '../../components/link/legacylink.js';

const CredentialDownloadIcon = ({
    credential,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      {credential.type === 'usk' &&
        <LegacyLink
          className="icon icon-sm"
          cmd="download_credential"
          credential_id={credential.id}
          package_format="rpm"
          title={_('Download RPM (.rpm) Package')}>
          <Icon img="rpm.svg" />
        </LegacyLink>
      }
      {credential.type === 'usk' &&
        <LegacyLink
          className="icon icon-sm"
          cmd="download_credential"
          credential_id={credential.id}
          package_format="deb"
          title={_('Download Debian (.deb) Package')}>
          <Icon img="deb.svg" />
        </LegacyLink>
      }
      {credential.type === 'usk' &&
        <LegacyLink
          className="icon icon-sm"
          cmd="download_credential"
          credential_id={credential.id}
          package_format="key"
          title={_('Download Public Key')}>
          <Icon img="key.svg" />
        </LegacyLink>
      }
      {credential.type === 'up' &&
        <LegacyLink
          className="icon icon-sm"
          cmd="download_credential"
          credential_id={credential.id}
          package_format="exe"
          title={_('Download Windows Executable (.exe)')}>
          <Icon img="exe.svg" />
        </LegacyLink>
      }
      {credential.type === 'cc' &&
        <LegacyLink
          className="icon icon-sm"
          cmd="download_credential"
          credential_id={credential.id}
          package_format="pem"
          title={_('Download Certificate (.pem)')}>
          <Icon img="key.svg" />
        </LegacyLink>
      }
    </Layout>
  );
};

CredentialDownloadIcon.propTypes = {
  credential: PropTypes.model.isRequired,
};

export default CredentialDownloadIcon;

// vim: set ts=2 sw=2 tw=80:
