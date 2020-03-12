/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {renderSelectItems} from '../../utils/render.js';
import withPrefix from '../../utils/withPrefix.js';

import Select from '../../components/form/select.js';
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
    <Layout flex="column" grow="1">
      <FormGroup title={_('Send to host')}>
        <Divider>
          <TextField
            name={prefix + 'send_host'}
            value={sendHost}
            size="30"
            onChange={onChange}
          />
          <Layout>{_('on port')}</Layout>
          <TextField
            name={prefix + 'send_port'}
            value={sendPort}
            maxLength="6"
            size="6"
            onChange={onChange}
          />
        </Divider>
      </FormGroup>

      <FormGroup title={_('Report')}>
        <Select
          name={prefix + 'send_report_format'}
          value={sendReportFormat}
          items={renderSelectItems(reportFormats)}
          onChange={onChange}
        />
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
