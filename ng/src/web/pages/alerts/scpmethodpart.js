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

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import {render_options} from '../../utils/render.js';
import withPrefix from '../../utils/withPrefix.js';

import Select from '../../components/form/select.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import TextArea from '../../components/form/textarea.js';

import NewIcon from '../../components/icon/newicon.js';

const ScpMethodPart = ({
    prefix,
    credentials,
    reportFormats,
    scpCredential,
    scpHost,
    scpKnownHosts,
    scpPath,
    scpReportFormat,
    onChange,
    onNewCredentialClick,
  }) => {
  const scp_credential_opts = render_options(credentials);
  const scp_report_format_opts = render_options(reportFormats);

  return (
    <Layout
      flex="column"
      box
      grow="1">
      <FormGroup title={_('Credential')}>
        <Divider>
          <Select
            name={prefix + 'scp_credential'}
            value={scpCredential}
            onChange={onChange}>
            {scp_credential_opts}
          </Select>
          <Layout>
            <NewIcon
              value={['up']}
              title={_('Create a credential')}
              onClick={onNewCredentialClick}/>
          </Layout>
        </Divider>
      </FormGroup>

      <FormGroup title={_('Host')}>
        <TextField
          grow="1"
          name={prefix + 'scp_host'}
          value={scpHost}
          onChange={onChange}
          maxLength="256"/>
      </FormGroup>

      <FormGroup title={_('Known Hosts')}>
        <TextArea
          rows="3" cols="50"
          name={prefix + 'scp_known_hosts'}
          value={scpKnownHosts}
          onChange={onChange}
          grow="1"/>
      </FormGroup>

      <FormGroup title={_('Path')}>
        <TextField
          name={prefix + 'scp_path'}
          value={scpPath}
          onChange={onChange}/>
      </FormGroup>

      <FormGroup title={_('Report')}>
        <Select
          name={prefix + 'scp_report_format'}
          value={scpReportFormat}
          onChange={onChange}>
          {scp_report_format_opts}
        </Select>
      </FormGroup>
    </Layout>
  );
};

ScpMethodPart.propTypes = {
  credentials: PropTypes.array,
  prefix: PropTypes.string,
  reportFormats: PropTypes.array,
  scpCredential: PropTypes.id,
  scpHost: PropTypes.string.isRequired,
  scpKnownHosts: PropTypes.string.isRequired,
  scpPath: PropTypes.string.isRequired,
  scpReportFormat: PropTypes.id,
  onChange: PropTypes.func,
  onNewCredentialClick: PropTypes.func,
};

export default withPrefix(ScpMethodPart);

// vim: set ts=2 sw=2 tw=80:
