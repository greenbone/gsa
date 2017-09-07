/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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

import {render_options} from '../../utils/render.js';
import withPrefix from '../../utils/withPrefix.js';

import Select2 from '../../components/form/select2.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import Text from '../../components/form/text.js';

import NewIcon from '../../components/icon/newicon.js';

const SmbMethodPart = ({
    prefix,
    credentials,
    reportFormats,
    smbCredential,
    smbFilePath,
    smbReportFormat,
    smbSharePath,
    onChange,
    onNewCredentialClick,
  }) => {
  const smb_credential_opts = render_options(credentials);
  const smb_report_format_opts = render_options(reportFormats);

  return (
    <Layout
      flex="column"
      box
      grow="1">
      <FormGroup title=" ">
        <Text>
          {_('Security note: The SMB protocol does not offer a ' +
             'fingerprint to establish complete mutual trust. Thus a ' +
             'man-in-the-middle attack can not be fully prevented.')}
        </Text>
      </FormGroup>

      <FormGroup title={_('Credential')}>
        <Select2
          name={prefix + 'smb_credential'}
          value={smbCredential}
          onChange={onChange}>
          {smb_credential_opts}
        </Select2>
        <Layout flex box>
          <NewIcon
            value={['up']}
            title={_('Create a credential')}
            onClick={onNewCredentialClick}/>
        </Layout>
      </FormGroup>

      <FormGroup title={_('Share path')}>
        <TextField
          grow="1"
          name={prefix + 'smb_share_path'}
          value={smbSharePath}
          onChange={onChange}
          maxLength="256"/>
      </FormGroup>

      <FormGroup title={_('File path')}>
        <TextField
          grow="1"
          name={prefix + 'smb_file_path'}
          value={smbFilePath}
          onChange={onChange}
          maxLength="256"/>
      </FormGroup>

      <FormGroup title={_('Report Format')}>
        <Select2
          name={prefix + 'smb_report_format'}
          value={smbReportFormat}
          onChange={onChange}>
          {smb_report_format_opts}
        </Select2>
      </FormGroup>
    </Layout>
  );
};

SmbMethodPart.propTypes = {
  credentials: PropTypes.arrayLike,
  prefix: PropTypes.string,
  reportFormats: PropTypes.arrayLike,
  smbCredential: PropTypes.id,
  smbFilePath: PropTypes.string.isRequired,
  smbReportFormat: PropTypes.id,
  smbSharePath: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onNewCredentialClick: PropTypes.func,
};

export default withPrefix(SmbMethodPart);

// vim: set ts=2 sw=2 tw=80:
