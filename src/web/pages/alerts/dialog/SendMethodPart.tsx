/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type ReportConfig from 'gmp/models/report-config';
import type ReportFormat from 'gmp/models/report-format';
import {selectSaveId} from 'gmp/utils/id';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import addPrefix from 'web/utils/add-prefix';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

interface SendMethodPartProps {
  prefix?: string;
  reportConfigs?: ReportConfig[];
  reportFormats?: ReportFormat[];
  sendHost?: string;
  sendPort?: string;
  sendReportConfig?: string;
  sendReportFormat?: string;
  onChange: (value: string | number, name?: string) => void;
}

const SendMethodPart = ({
  prefix: initialPrefix,
  reportConfigs = [],
  reportFormats = [],
  sendHost,
  sendPort,
  sendReportConfig,
  sendReportFormat,
  onChange,
}: SendMethodPartProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const prefix = addPrefix(initialPrefix);

  const [reportFormatId, setReportFormatId] = useState<string | undefined>(
    selectSaveId(reportFormats, sendReportFormat),
  );
  const reportConfigItems = renderSelectItems(
    reportConfigs.filter(config => {
      return reportFormatId === config.reportFormat?.id;
    }) as RenderSelectItemProps[],
    UNSET_VALUE,
  );
  const [sendConfigId, setSendConfigId] = useState<string>(
    selectSaveId(reportConfigs, sendReportConfig, UNSET_VALUE) as string,
  );
  const handleReportConfigIdChange = (value: string, name?: string) => {
    setSendConfigId(value);
    onChange(value, name);
  };
  const handleReportFormatIdChange = (value: string, name?: string) => {
    setSendConfigId(UNSET_VALUE);
    onChange(UNSET_VALUE, prefix('send_report_config'));
    setReportFormatId(value);
    onChange(value, name);
  };
  return (
    <>
      <FormGroup direction="row">
        <TextField
          grow="1"
          name={prefix('send_host')}
          title={_('Send to host')}
          value={sendHost}
          onChange={onChange}
        />
        <TextField
          name={prefix('send_port')}
          title={_('on port')}
          value={sendPort}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <Select
          items={renderSelectItems(reportFormats as RenderSelectItemProps[])}
          label={_('Report Format')}
          name={prefix('send_report_format')}
          value={reportFormatId}
          onChange={handleReportFormatIdChange}
        />
        {capabilities.mayOp('get_report_configs') && (
          <Select
            items={reportConfigItems}
            label={_('Report Config')}
            name={prefix('send_report_config')}
            value={sendConfigId}
            onChange={handleReportConfigIdChange}
          />
        )}
      </FormGroup>
    </>
  );
};

export default SendMethodPart;
