/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import {render_options, withPrefix} from '../render.js';

import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';

import NewIcon from '../icons/newicon.js';

const VeriniceMethodPart = ({
    prefix,
    veriniceServerUrl,
    veriniceServerCredential,
    veriniceServerReportFormat,
    reportFormats,
    credentials,
    onChange,
    onNewCredentialClick,
  }) => {
    let verinice_credential_opts = render_options(credentials);
    let verinice_report_format_opts = render_options(
      reportFormats.filter(format => format.extension === 'vna'));
  return (
    <Layout
      flex="column"
      grow="1"
      box>
      <FormGroup title={_('verinice.PRO URL')}>
        <TextField
          grow="1"
          size="30"
          maxLength="256"
          name={prefix + 'verinice_server_url'}
          value={veriniceServerUrl}
          onChange={onChange}/>
      </FormGroup>

      <FormGroup title={_('Credential')}>
        <Select2
          name={prefix + '"verinice_server_credential'}
          value={veriniceServerCredential}
          onChange={onChange}>
          {verinice_credential_opts}
        </Select2>
        <Layout flex box>
          <NewIcon
            title={_('Create a credential')}
            value={['up']}
            onClick={onNewCredentialClick}/>
        </Layout>
      </FormGroup>

      <FormGroup title={_('verinice.PRO Report')}>
        <Select2
          name={prefix + 'verinice_server_report_format'}
          value={veriniceServerReportFormat}
          onChange={onChange}>
          {verinice_report_format_opts}
        </Select2>
      </FormGroup>

    </Layout>
  );
};

VeriniceMethodPart.propTypes = {
  credentials: PropTypes.arrayLike,
  prefix: React.PropTypes.string,
  reportFormats: PropTypes.arrayLike,
  veriniceServerCredential: PropTypes.id,
  veriniceServerReportFormat: PropTypes.id,
  veriniceServerUrl: React.PropTypes.string,
  onNewCredentialClick: React.PropTypes.func,
  onChange: React.PropTypes.func,
};

export default withPrefix(VeriniceMethodPart);

// vim: set ts=2 sw=2 tw=80:
