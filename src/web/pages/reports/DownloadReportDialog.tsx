/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type Filter from 'gmp/models/filter';
import type ReportConfig from 'gmp/models/report-config';
import type ReportFormat from 'gmp/models/report-format';
import {CONTAINER_SCANNING_RESULTS_THRESHOLD} from 'gmp/settings';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined, isString} from 'gmp/utils/identity';
import ComposerContent, {
  COMPOSER_CONTENT_DEFAULTS,
} from 'web/components/dialog/ComposerContent';
import SaveDialog from 'web/components/dialog/SaveDialog';
import CheckBox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import ContainerScanningThresholdMessage from 'web/pages/reports/ContainerScanningThresholdMessage';
import ThresholdMessage from 'web/pages/reports/ThresholdMessage';
import {renderSelectItems, type RenderSelectItemProps} from 'web/utils/Render';

interface DownloadReportDialogProps {
  audit?: boolean;
  defaultReportConfigId?: string;
  defaultReportFormatId?: string;
  filter: Filter | string;
  includeNotes?: boolean;
  includeOverrides?: boolean;
  isContainerScanning?: boolean;
  reportConfigs?: ReportConfig[];
  reportFormats?: ReportFormat[];
  showThresholdMessage?: boolean;
  storeAsDefault?: boolean;
  threshold?: number;
  totalResultCount?: number;
  onClose: () => void;
  onSave: (values: Record<string, unknown>) => Promise<void>;
}

const DownloadReportDialog = ({
  audit = false,
  defaultReportConfigId,
  defaultReportFormatId,
  filter,
  includeNotes = COMPOSER_CONTENT_DEFAULTS.includeNotes,
  includeOverrides = COMPOSER_CONTENT_DEFAULTS.includeOverrides,
  isContainerScanning = false,
  reportConfigs,
  reportFormats,
  showThresholdMessage = false,
  storeAsDefault,
  threshold,
  totalResultCount = 0,
  onClose,
  onSave,
}: DownloadReportDialogProps) => {
  const [_] = useTranslation();
  const filterString = isString(filter) ? filter : filter.toFilterString();

  let initialReportConfigId: string;
  if (defaultReportConfigId === '' || !isDefined(defaultReportConfigId)) {
    initialReportConfigId = '';
  } else {
    initialReportConfigId =
      selectSaveId(reportConfigs, defaultReportConfigId, '') ?? '';
  }

  const [reportFormatIdInState, setReportFormatIdInState] = useState(
    selectSaveId(reportFormats, defaultReportFormatId),
  );
  const [reportConfigIdInState, setReportConfigIdInState] = useState(
    initialReportConfigId,
  );

  const unControlledValues = {
    includeNotes,
    includeOverrides,
    storeAsDefault,
  };

  const handleReportFormatIdChange = (value: string) => {
    setReportConfigIdInState('');
    setReportFormatIdInState(value);
  };

  const handleReportConfigIdChange = (value: string) => {
    setReportConfigIdInState(value);
  };

  const handleSave = async (values: Record<string, unknown>) => {
    await onSave({
      ...values,
      reportConfigId: reportConfigIdInState,
      reportFormatId: reportFormatIdInState,
    });
  };

  const showContainerScanningWarning =
    isContainerScanning &&
    totalResultCount > CONTAINER_SCANNING_RESULTS_THRESHOLD;

  const getFilteredReportFormats = () => {
    if (!isDefined(reportFormats)) {
      return [];
    }
    return reportFormats.filter(format => {
      if (isDefined(format.report_type)) {
        const allowedTypes = audit ? ['audit', 'all'] : ['scan', 'all'];
        return allowedTypes.includes(format.report_type);
      }
      return true;
    });
  };

  return (
    <SaveDialog
      buttonTitle={_('OK')}
      defaultValues={unControlledValues}
      title={
        audit
          ? _('Compose Content for Compliance Report')
          : _('Compose Content for Scan Report')
      }
      onClose={onClose}
      onSave={handleSave}
    >
      {({values, onValueChange}) => {
        const filteredReportConfigs = isDefined(reportConfigs)
          ? reportConfigs.filter(
              config => config.reportFormat?.id === reportFormatIdInState,
            )
          : [];

        const filteredReportFormats = getFilteredReportFormats();

        return (
          <>
            <ComposerContent
              audit={audit}
              filterString={filterString}
              includeNotes={values.includeNotes}
              includeOverrides={values.includeOverrides}
              onValueChange={onValueChange}
            />

            <FormGroup title={_('Report Format')}>
              <Select
                grow="1"
                items={renderSelectItems(
                  filteredReportFormats as RenderSelectItemProps[],
                )}
                name="reportFormatId"
                value={reportFormatIdInState}
                width="auto"
                onChange={handleReportFormatIdChange}
              />
            </FormGroup>
            {isDefined(reportConfigs) && (
              <FormGroup title={_('Report Config')}>
                <Select
                  grow="1"
                  items={renderSelectItems(
                    filteredReportConfigs as RenderSelectItemProps[],
                    '',
                  )}
                  name="reportConfigId"
                  value={reportConfigIdInState}
                  width="auto"
                  onChange={handleReportConfigIdChange}
                />
              </FormGroup>
            )}
            <CheckBox
              checked={values.storeAsDefault}
              checkedValue={true}
              name="storeAsDefault"
              title={_('Store as default')}
              toolTipTitle={_(
                'Store indicated settings (without filter) as default',
              )}
              unCheckedValue={false}
              onChange={onValueChange}
            />
            {showContainerScanningWarning ? (
              <ContainerScanningThresholdMessage />
            ) : (
              showThresholdMessage &&
              isDefined(threshold) && <ThresholdMessage threshold={threshold} />
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

export default DownloadReportDialog;
