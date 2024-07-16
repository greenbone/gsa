/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

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

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

const StyledDiv = styled.div`
  text-align: end;
`;

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
        const filteredReportConfigs = reportConfigs.filter(
          config => config.report_format.id === reportFormatIdInState,
        );

        return (
          <Layout flex="column">
            <ComposerContent
              filterString={filterString}
              includeNotes={values.includeNotes}
              includeOverrides={values.includeOverrides}
              onValueChange={onValueChange}
            />
            <FormGroup title={_('Report Format')} titleSize="3">
              <Divider flex="column">
                <Select
                  name="reportFormatId"
                  value={reportFormatIdInState}
                  items={renderSelectItems(reportFormats)}
                  width="auto"
                  onChange={handleReportFormatIdChange}
                />
              </Divider>
            </FormGroup>
            <FormGroup title={_('Report Config')} titleSize="3">
              <Divider flex="column">
                <Select
                  name="reportConfigId"
                  value={reportConfigIdInState}
                  items={renderSelectItems(filteredReportConfigs, '')}
                  width="auto"
                  onChange={handleReportConfigIdChange}
                />
              </Divider>
            </FormGroup>
            <StyledDiv>
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
            </StyledDiv>
            {showThresholdMessage && <ThresholdMessage threshold={threshold} />}
          </Layout>
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
