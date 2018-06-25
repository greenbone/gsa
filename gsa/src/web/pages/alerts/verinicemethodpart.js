/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {USERNAME_PASSWORD_CREDENTIAL_TYPE} from 'gmp/models/credential.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {render_select_items} from '../../utils/render.js';
import withPrefix from '../../utils/withPrefix.js';

import Select from '../../components/form/select.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';

import NewIcon from '../../components/icon/newicon.js';

const VERINICE_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

const VeriniceMethodPart = ({
  prefix,
  veriniceServerUrl,
  veriniceServerCredential,
  veriniceServerReportFormat,
  reportFormats = [],
  credentials = [],
  onChange,
  onCredentialChange,
  onNewCredentialClick,
}) => {
  reportFormats = reportFormats.filter(format => format.extension === 'vna');
  credentials = credentials.filter(
    cred => cred.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE);
  return (
    <Layout
      flex="column"
      grow="1"
    >
      <FormGroup title={_('verinice.PRO URL')}>
        <TextField
          grow="1"
          size="30"
          maxLength="256"
          name={prefix + 'verinice_server_url'}
          value={veriniceServerUrl}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Credential')}>
        <Divider>
          <Select
            name={prefix + 'verinice_server_credential'}
            items={render_select_items(credentials)}
            value={veriniceServerCredential}
            onChange={onCredentialChange}
          />
          <Layout flex box>
            <NewIcon
              size="small"
              title={_('Create a credential')}
              value={VERINICE_CREDENTIAL_TYPES}
              onClick={onNewCredentialClick}
          />
          </Layout>
        </Divider>
      </FormGroup>

      <FormGroup title={_('verinice.PRO Report')}>
        <Select
          name={prefix + 'verinice_server_report_format'}
          items={render_select_items(reportFormats)}
          value={veriniceServerReportFormat}
          onChange={onChange}
        />
      </FormGroup>

    </Layout>
  );
};

VeriniceMethodPart.propTypes = {
  credentials: PropTypes.array,
  prefix: PropTypes.string,
  reportFormats: PropTypes.array,
  veriniceServerCredential: PropTypes.id,
  veriniceServerReportFormat: PropTypes.id,
  veriniceServerUrl: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onCredentialChange: PropTypes.func.isRequired,
  onNewCredentialClick: PropTypes.func.isRequired,
};

export default withPrefix(VeriniceMethodPart);

// vim: set ts=2 sw=2 tw=80:
