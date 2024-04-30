/* Copyright (C) 2016-2022 Greenbone AG
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
import React, {useState} from 'react';
import {selectSaveId} from 'gmp/utils/id';
import {renderSelectItems, UNSET_VALUE} from '../../utils/render';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import useTranslation from 'web/hooks/useTranslation';

const SendMethodPart = ({
  prefix,
  reportConfigs,
  reportFormats,
  sendHost,
  sendPort,
  sendReportConfig,
  sendReportFormat,
  onChange,
}) => {
  const [_] = useTranslation();

  const [reportFormatIdInState, setReportFormatId] = useState(
    selectSaveId(reportFormats, sendReportFormat),
  );
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatIdInState === config.report_format._id;
    }),
    UNSET_VALUE,
  );
  const [sendConfigIdInState, setSendConfigId] = useState(
    selectSaveId(reportConfigs, sendReportConfig, UNSET_VALUE),
  );
  const handleReportConfigIdChange = (value, name) => {
    setSendConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value, name) => {
    setSendConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, 'method_data_send_report_config');
    setReportFormatId(value);
    onChange(value, name);
  };
  return (
    <>
      <FormGroup title={_('Send to host')} direction="row">
        <TextField
          grow="1"
          name={prefix + 'send_host'}
          value={sendHost}
          onChange={onChange}
        />
        {_('on port')}
        <TextField
          name={prefix + 'send_port'}
          value={sendPort}
          maxLength="6"
          size="6"
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Report')}>
        <Select
          name={prefix + 'send_report_format'}
          value={reportFormatIdInState}
          items={renderSelectItems(reportFormats)}
          onChange={handleReportFormatIdChange}
        />
        <label htmlFor="report-config-select">
          &nbsp; Report Config &nbsp;{' '}
        </label>
        <Select
          name={prefix + 'send_report_config'}
          id="report-config-select"
          value={sendConfigIdInState}
          items={reportConfigItems}
          onChange={handleReportConfigIdChange}
        />
      </FormGroup>
    </>
  );
};

SendMethodPart.propTypes = {
  prefix: PropTypes.string,
  reportConfigs: PropTypes.array,
  reportFormats: PropTypes.array,
  sendHost: PropTypes.string.isRequired,
  sendPort: PropTypes.string.isRequired,
  sendReportConfig: PropTypes.id,
  sendReportFormat: PropTypes.id,
  onChange: PropTypes.func,
};

export default withPrefix(SendMethodPart);

// vim: set ts=2 sw=2 tw=80:
