/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
