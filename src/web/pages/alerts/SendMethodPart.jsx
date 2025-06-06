/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {selectSaveId} from 'gmp/utils/id';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/Render';
import withPrefix from 'web/utils/withPrefix';

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
  const capabilities = useCapabilities();
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
      <FormGroup direction="row" title={_('Send to host')}>
        <TextField
          grow="1"
          name={prefix + 'send_host'}
          value={sendHost}
          onChange={onChange}
        />
        {_('on port')}
        <TextField
          maxLength="6"
          name={prefix + 'send_port'}
          size="6"
          value={sendPort}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Report')}>
        <Select
          items={renderSelectItems(reportFormats)}
          name={prefix + 'send_report_format'}
          value={reportFormatIdInState}
          onChange={handleReportFormatIdChange}
        />
        {capabilities.mayOp('get_report_configs') && (
          <>
            <label htmlFor="report-config-select">
              &nbsp; Report Config &nbsp;
            </label>
            <Select
              id="report-config-select"
              items={reportConfigItems}
              name={prefix + 'send_report_config'}
              value={sendConfigIdInState}
              onChange={handleReportConfigIdChange}
            />
          </>
        )}
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
