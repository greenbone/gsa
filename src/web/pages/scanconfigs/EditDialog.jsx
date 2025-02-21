/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {SCANCONFIG_TREND_STATIC} from 'gmp/models/scanconfig';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {useReducer, useState, useEffect, useCallback} from 'react';
import DialogInlineNotification from 'web/components/dialog/DialogInlineNotification';
import SaveDialog from 'web/components/dialog/SaveDialog';
import TextField from 'web/components/form/TextField';
import Loading from 'web/components/loading/Loading';
import SearchBar from 'web/components/searchbar/SearchBar';
import useTranslation from 'web/hooks/useTranslation';
import NvtFamilies from 'web/pages/scanconfigs/NvtFamilies';
import NvtPreferences, {NvtPreferencePropType} from 'web/pages/scanconfigs/NvtPreferences';
import ScannerPreferences, {
  ScannerPreferencePropType,
} from 'web/pages/scanconfigs/ScannerPreferences';
import PropTypes from 'web/utils/PropTypes';

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
    case 'setValue': {
      const {newState} = action;
      return {
        ...state,
        ...newState,
      };
    }
    case 'setAll': {
      const {formValues} = action;
      return formValues;
    }
    default:
      return state;
  }
};

/**
 * Filters items based on the query and updates the filtered items state.
 *
 * @param {string} query - The search query.
 * @param {Array} items - The list of items to filter.
 * @param {Function} setFilteredItems - The function to update the filtered items state.
 * @param {Function} getItemName - The function to get the name property from an item.
 */
export const handleSearchChange = (
  query,
  items,
  setFilteredItems,
  getItemName,
) => {
  const filtered = items.filter(item =>
    getItemName(item).toLowerCase().includes(query.toLowerCase()),
  );

  setFilteredItems(filtered);
};

const EditScanConfigDialog = ({
  comment = '',
  configId,
  configFamilies = {},
  configIsInUse = false,
  editNvtDetailsTitle,
  editNvtFamiliesTitle,
  families = [],
  isLoadingConfig = true,
  isLoadingFamilies = true,
  isLoadingScanners = true,
  name,
  nvtPreferences = [],
  scannerPreferences = [],
  scannerId,
  scanners = [],
  title,
  usageType = 'scan',
  onClose,
  onEditConfigFamilyClick,
  onEditNvtDetailsClick,
  onSave,
}) => {
  const [_] = useTranslation();
  const [scannerPreferenceValues, dispatch] = useReducer(
    reducer,
    createScannerPreferenceValues(scannerPreferences),
  );
  const [trendValues, setTrendValues] = useState();
  const [selectValues, setSelectValues] = useState();
  const [filteredFamilies, setFilteredFamilies] = useState(families);
  const [filteredScannerPreferences, setFilteredScannerPreferences] =
    useState(scannerPreferences);
  const [filteredNvtPreferences, setFilteredNvtPreferences] =
    useState(nvtPreferences);

  useEffect(() => {
    dispatch({
      type: 'setAll',
      formValues: createScannerPreferenceValues(scannerPreferences),
    });
  }, [scannerPreferences]);

  useEffect(() => {
    setFilteredFamilies(families);
  }, [families]);

  useEffect(() => {
    setFilteredScannerPreferences(scannerPreferences);
  }, [scannerPreferences]);

  useEffect(() => {
    setFilteredNvtPreferences(nvtPreferences);
  }, [nvtPreferences]);

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

  const handleSearchChangeCallback = useCallback(
    query => {
      handleSearchChange(
        query,
        families,
        setFilteredFamilies,
        item => item.name,
      );
      handleSearchChange(
        query,
        scannerPreferences,
        setFilteredScannerPreferences,
        item => item.name,
      );
      handleSearchChange(
        query,
        nvtPreferences,
        setFilteredNvtPreferences,
        item => item.nvt.name,
      );
    },
    [families, scannerPreferences, nvtPreferences],
  );

  const isLoading = isLoadingConfig || isLoadingFamilies || isLoadingScanners;
  const matchesCount = isLoading
    ? 1
    : filteredFamilies.length +
      filteredScannerPreferences.length +
      filteredNvtPreferences.length;

  return (
    <SaveDialog
      defaultValues={uncontrolledData}
      loading={isLoadingConfig}
      title={title}
      values={controlledData}
      width="900px"
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => (
        <>
          <TextField
            name="name"
            title={_('Name')}
            value={state.name}
            onChange={onValueChange}
          />

          <TextField
            name="comment"
            title={_('Comment')}
            value={state.comment}
            onChange={onValueChange}
          />

          <SearchBar
            matchesCount={matchesCount}
            placeholder={_('Search for families, preferences, or NVTs')}
            onSearch={handleSearchChangeCallback}
          />
          {configIsInUse ? (
            <DialogInlineNotification data-testid="inline-notification">
              {notification}
            </DialogInlineNotification>
          ) : (
            <>
              {isLoadingConfig || isLoadingFamilies ? (
                <Loading />
              ) : (
                <NvtFamilies
                  configFamilies={configFamilies}
                  editTitle={editNvtFamiliesTitle}
                  families={filteredFamilies}
                  select={selectValues}
                  trend={trendValues}
                  onEditConfigFamilyClick={onEditConfigFamilyClick}
                  onValueChange={onValueChange}
                />
              )}

              {isLoadingConfig ? (
                <Loading />
              ) : (
                <ScannerPreferences
                  preferences={filteredScannerPreferences}
                  values={scannerPreferenceValues}
                  onValuesChange={dispatch}
                />
              )}

              {isLoadingConfig ? (
                <Loading />
              ) : (
                <NvtPreferences
                  editTitle={editNvtDetailsTitle}
                  preferences={filteredNvtPreferences}
                  onEditNvtDetailsClick={onEditNvtDetailsClick}
                />
              )}
            </>
          )}
        </>
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
