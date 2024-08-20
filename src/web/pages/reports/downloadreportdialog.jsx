/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React, {useState} from 'react';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {selectSaveId} from 'gmp/utils/id';
import {isDefined, isString} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import ComposerContent, {
  COMPOSER_CONTENT_DEFAULTS,
} from 'web/components/dialog/composercontent';
import ThresholdMessage from 'web/pages/reports/thresholdmessage';

import SaveDialog from 'web/components/dialog/savedialog';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import useTranslation from 'web/hooks/useTranslation';

const DownloadReportDialog = ({
  defaultReportConfigId,
  defaultReportFormatId,
  filter = {},
  includeNotes = COMPOSER_CONTENT_DEFAULTS.includeNotes,
  includeOverrides = COMPOSER_CONTENT_DEFAULTS.includeOverrides,
  reportConfigId,
  reportConfigs,
  reportFormats,
  showThresholdMessage = false,
  storeAsDefault,
  threshold,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const filterString = isString(filter) ? filter : filter.toFilterString();

  if (defaultReportConfigId === '' || !isDefined(defaultReportConfigId)) {
    reportConfigId = '';
  } else {
    reportConfigId = selectSaveId(reportConfigs, defaultReportConfigId, '');
  }

  const [reportFormatIdInState, setReportFormatIdInState] = useState(
    selectSaveId(reportFormats, defaultReportFormatId),
  );
  const [reportConfigIdInState, setReportConfigIdInState] =
    useState(reportConfigId);

  const unControlledValues = {
    includeNotes,
    includeOverrides,
    storeAsDefault,
  };

  const handleReportFormatIdChange = value => {
    setReportConfigIdInState('');
    setReportFormatIdInState(value);
  };

  const handleReportConfigIdChange = value => {
    setReportConfigIdInState(value);
  };

  const handleSave = async values => {
    await onSave({
      ...values,
      reportConfigId: reportConfigIdInState,
      reportFormatId: reportFormatIdInState,
    });
  };

  return (
    <SaveDialog
      buttonTitle={_('OK')}
      title={_('Compose Content for Scan Report')}
      defaultValues={unControlledValues}
      onClose={onClose}
      onSave={handleSave}
    >
      {({values, onValueChange}) => {
        const filteredReportConfigs = isDefined(reportConfigs)
          ? reportConfigs.filter(
              config => config.report_format.id === reportFormatIdInState,
            )
          : [];

        return (
          <>
            <ComposerContent
              filterString={filterString}
              includeNotes={values.includeNotes}
              includeOverrides={values.includeOverrides}
              onValueChange={onValueChange}
            />

            <FormGroup title={_('Report Format')}>
              <Select
                grow="1"
                name="reportFormatId"
                value={reportFormatIdInState}
                items={renderSelectItems(reportFormats)}
                width="auto"
                onChange={handleReportFormatIdChange}
              />
            </FormGroup>
            {isDefined(reportConfigs) && (
              <FormGroup title={_('Report Config')}>
                <Select
                  grow="1"
                  name="reportConfigId"
                  value={reportConfigIdInState}
                  items={renderSelectItems(filteredReportConfigs, '')}
                  width="auto"
                  onChange={handleReportConfigIdChange}
                />
              </FormGroup>
            )}
            <CheckBox
              name="storeAsDefault"
              checked={storeAsDefault}
              checkedValue={YES_VALUE}
              unCheckedValue={NO_VALUE}
              title={_('Store as default')}
              toolTipTitle={_(
                'Store indicated settings (without filter) as default',
              )}
              onChange={onValueChange}
            />
            {showThresholdMessage && <ThresholdMessage threshold={threshold} />}
          </>
        );
      }}
    </SaveDialog>
  );
};

DownloadReportDialog.propTypes = {
  defaultReportConfigId: PropTypes.id,
  defaultReportFormatId: PropTypes.id,
  filter: PropTypes.filter.isRequired,
  includeNotes: PropTypes.number,
  includeOverrides: PropTypes.number,
  reportConfigId: PropTypes.id,
  reportConfigs: PropTypes.array,
  reportFormats: PropTypes.array,
  showThresholdMessage: PropTypes.bool,
  storeAsDefault: PropTypes.bool,
  threshold: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default DownloadReportDialog;
