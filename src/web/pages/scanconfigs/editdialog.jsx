/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React, {useReducer, useState, useEffect} from 'react';

import _ from 'gmp/locale';

import {SCANCONFIG_TREND_STATIC} from 'gmp/models/scanconfig';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';
import DialogInlineNotification from 'web/components/dialog/dialoginlinenotification';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import Loading from 'web/components/loading/loading';

import Layout from 'web/components/layout/layout';

import NvtFamilies from './nvtfamilies';
import NvtPreferences, {NvtPreferencePropType} from './nvtpreferences';
import ScannerPreferences, {
  ScannerPreferencePropType,
} from './scannerpreferences';

const createTrendAndSelect = (scanConfigFamilies = {}, allFamilies = []) => {
  const trend = {};
  const select = {};

  allFamilies.forEach(family => {
    const {name} = family;
    const configFamily = scanConfigFamilies[name];

    if (isDefined(configFamily)) {
      trend[name] = configFamily.trend;
      select[name] =
        configFamily.nvts.count === family.maxNvtCount ? YES_VALUE : NO_VALUE;
    } else {
      trend[name] = SCANCONFIG_TREND_STATIC;
      select[name] = NO_VALUE;
    }
  });

  return {
    trend,
    select,
  };
};

const createScannerPreferenceValues = (preferences = []) => {
  const values = {};

  preferences.forEach(preference => {
    values[preference.name] = preference.value;
  });

  return values;
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'setValue':
      const {newState} = action;
      return {
        ...state,
        ...newState,
      };
    case 'setAll':
      const {formValues} = action;
      return formValues;
    default:
      return state;
  }
};

const EditScanConfigDialog = ({
  comment = '',
  configId,
  configFamilies,
  configIsInUse = false,
  editNvtDetailsTitle,
  editNvtFamiliesTitle,
  families,
  isLoadingConfig = true,
  isLoadingFamilies = true,
  isLoadingScanners = true,
  name,
  nvtPreferences,
  scannerPreferences,
  scannerId,
  scanners,
  title,
  usageType = 'scan',
  onClose,
  onEditConfigFamilyClick,
  onEditNvtDetailsClick,
  onSave,
}) => {
  const [scannerPreferenceValues, dispatch] = useReducer(
    reducer,
    createScannerPreferenceValues(scannerPreferences),
  );
  const [trendValues, setTrendValues] = useState();
  const [selectValues, setSelectValues] = useState();

  useEffect(() => {
    dispatch({
      type: 'setAll',
      formValues: createScannerPreferenceValues(scannerPreferences),
    });
  }, [scannerPreferences]);

  // trend and select are created only once and only after the whole config is loaded
  if (!isDefined(trendValues) && !isDefined(selectValues) && !isLoadingConfig) {
    const {trend, select} = createTrendAndSelect(configFamilies, families);
    setTrendValues(trend);
    setSelectValues(select);
  }

  const uncontrolledData = {
    comment,
    name,
    scannerId,
  };

  const controlledData = {
    id: configId,
    scannerPreferenceValues,
    select: selectValues,
    trend: trendValues,
  };

  const notification =
    usageType === 'policy'
      ? _(
          'The policy is currently in use by one or more audits, therefore only name and comment can be modified.',
        )
      : _(
          'The scan config is currently in use by one or more tasks, therefore only name and comment can be modified.',
        );

  return (
    <SaveDialog
      loading={isLoadingConfig}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={uncontrolledData}
      values={controlledData}
    >
      {({values: state, onValueChange}) => (
        <Layout flex="column">
          <FormGroup title={_('Name')}>
            <TextField
              name="name"
              grow="1"
              value={state.name}
              size="30"
              onChange={onValueChange}
            />
          </FormGroup>

          <FormGroup title={_('Comment')}>
            <TextField
              name="comment"
              value={state.comment}
              grow="1"
              size="30"
              onChange={onValueChange}
            />
          </FormGroup>
          {configIsInUse ? (
            <DialogInlineNotification data-testid="inline-notification">
              {notification}
            </DialogInlineNotification>
          ) : (
            <React.Fragment>
              {isLoadingConfig || isLoadingFamilies ? (
                <Loading />
              ) : (
                <NvtFamilies
                  configFamilies={configFamilies}
                  editTitle={editNvtFamiliesTitle}
                  families={families}
                  trend={trendValues}
                  select={selectValues}
                  onEditConfigFamilyClick={onEditConfigFamilyClick}
                  onValueChange={onValueChange}
                />
              )}

              {isLoadingConfig ? (
                <Loading />
              ) : (
                <ScannerPreferences
                  values={scannerPreferenceValues}
                  preferences={scannerPreferences}
                  onValuesChange={dispatch}
                />
              )}

              {isLoadingConfig ? (
                <Loading />
              ) : (
                <NvtPreferences
                  editTitle={editNvtDetailsTitle}
                  preferences={nvtPreferences}
                  onEditNvtDetailsClick={onEditNvtDetailsClick}
                />
              )}
            </React.Fragment>
          )}
        </Layout>
      )}
    </SaveDialog>
  );
};

EditScanConfigDialog.propTypes = {
  comment: PropTypes.string,
  configFamilies: PropTypes.object,
  configId: PropTypes.id.isRequired,
  configIsInUse: PropTypes.bool,
  editNvtDetailsTitle: PropTypes.string.isRequired,
  editNvtFamiliesTitle: PropTypes.string.isRequired,
  families: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      maxNvtCount: PropTypes.number,
    }),
  ),
  isLoadingConfig: PropTypes.bool,
  isLoadingFamilies: PropTypes.bool,
  isLoadingScanners: PropTypes.bool,
  name: PropTypes.string,
  nvtPreferences: PropTypes.arrayOf(NvtPreferencePropType),
  scannerId: PropTypes.id,
  scannerPreferences: PropTypes.arrayOf(ScannerPreferencePropType),
  scanners: PropTypes.array,
  select: PropTypes.object,
  title: PropTypes.string.isRequired,
  usageType: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onEditConfigFamilyClick: PropTypes.func,
  onEditNvtDetailsClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default EditScanConfigDialog;

// vim: set ts=2 sw=2 tw=80:
