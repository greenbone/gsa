/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import _ from 'gmp/locale.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {render_options} from '../../utils/render.js';
import withPrefix from '../../utils/withPrefix.js';

import Select2 from '../../components/form/select2.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';

const SendMethodPart = ({
    prefix,
    reportFormats,
    sendHost,
    sendPort,
    sendReportFormat,
    onChange,
  }) => {
  return (
    <Layout
      flex="column"
      box
      grow="1">
      <FormGroup title={_('Send to host')}>
        <Divider>
          <TextField
            name={prefix + 'send_host'}
            value={sendHost}
            size="30"
            maxLength="256"
            onChange={onChange}/>
          <Layout flex box>
            {_('on port')}
          </Layout>
          <TextField
            name={prefix + 'send_port'}
            value={sendPort}
            maxLength="6"
            size="6"
            onChange={onChange}/>
        </Divider>
      </FormGroup>

      <FormGroup title={_('Report')}>
        <Select2
          name={prefix + 'send_report_format'}
          value={sendReportFormat}
          onChange={onChange}>
          {render_options(reportFormats)}
        </Select2>
      </FormGroup>
    </Layout>
  );
};

SendMethodPart.propTypes = {
  prefix: PropTypes.string,
  reportFormats: PropTypes.array,
  sendHost: PropTypes.string.isRequired,
  sendPort: PropTypes.string.isRequired,
  sendReportFormat: PropTypes.id,
  onChange: PropTypes.func,
};

export default withPrefix(SendMethodPart);

// vim: set ts=2 sw=2 tw=80:
