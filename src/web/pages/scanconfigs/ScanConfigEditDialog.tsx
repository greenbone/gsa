/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  useReducer,
  useState,
  useEffect,
  useCallback,
  memo,
  useRef,
} from 'react';
import {
  type ScanConfigFamilyTrends,
  type ScanConfigNvtsSelected,
  type ScanConfigPreferenceValues,
} from 'gmp/commands/scan-config';
import {
  SCANCONFIG_TREND_STATIC,
  type ScanConfigPreference,
  type ScanConfigUsageType,
  type ScanConfigFamilies,
  type ScanConfigFamily,
  type ScanConfigTrend,
} from 'gmp/models/scan-config';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import DialogInlineNotification from 'web/components/dialog/DialogInlineNotification';
import SaveDialog from 'web/components/dialog/SaveDialog';
import TextField from 'web/components/form/TextField';
import Loading from 'web/components/loading/Loading';
import SearchBar from 'web/components/searchbar/SearchBar';
import useTranslation from 'web/hooks/useTranslation';
import ScanConfigNvtFamilies from 'web/pages/scanconfigs/ScanConfigNvtFamilies';
import ScanConfigNvtPreferences from 'web/pages/scanconfigs/ScanConfigNvtPreferences';
import ScanConfigScannerPreferences from 'web/pages/scanconfigs/ScanConfigScannerPreferences';

interface SyncData {
  name?: string;
  comment?: string;
}

type SyncDataRef = React.MutableRefObject<SyncData>;

interface BasicFieldsContainerProps {
  initialName: string;
  initialComment: string;
  syncDataRef: (ref: SyncDataRef) => void;
}

interface ScanConfigEditDialogDefaultValues {
  scannerId?: string;
}

interface ScanConfigEditDialogValues {
  id: string;
  scannerPreferenceValues?: ScanConfigPreferenceValues;
  select?: ScanConfigNvtsSelected;
  trend?: ScanConfigFamilyTrends;
  familyTrend?: ScanConfigTrend;
}

export type ScanConfigEditDialogData = ScanConfigEditDialogDefaultValues &
  ScanConfigEditDialogValues &
  Required<SyncData>;

interface ScanConfigEditDialogProps {
  comment?: string;
  configId: string;
  configFamilies?: ScanConfigFamilies;
  configFamiliesTrend?: ScanConfigTrend;
  configIsInUse?: boolean;
  editNvtDetailsTitle: string;
  editNvtFamiliesTitle: string;
  error?: string;
  families?: ScanConfigFamily[];
  isLoadingConfig?: boolean;
  isLoadingFamilies?: boolean;
  isLoadingScanners?: boolean;
  name: string;
  nvtPreferences?: ScanConfigPreference[];
  scannerPreferences?: ScanConfigPreference[];
  scannerId?: string;
  title: string;
  usageType?: ScanConfigUsageType;
  onClose: () => void;
  onEditConfigFamilyClick?: (familyName: string) => void;
  onEditNvtDetailsClick?: (nvtOid: string) => void;
  onSave: (values: ScanConfigEditDialogData) => void;
}

const MemoizedNvtPreferences = memo(ScanConfigNvtPreferences);

const createTrendAndSelect = (
  scanConfigFamilies: ScanConfigFamilies = {},
  allFamilies: ScanConfigFamily[] = [],
) => {
  const trend = {};
  const select = {};

  allFamilies.forEach(family => {
    const {name} = family;
    const configFamily = scanConfigFamilies[name] as ScanConfigFamily;

    if (isDefined(configFamily)) {
      trend[name] = configFamily.trend as ScanConfigTrend;
      select[name] =
        isDefined(configFamily.nvts?.count) &&
        configFamily.nvts.count === family.nvts?.max
          ? YES_VALUE
          : NO_VALUE;
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

const createScannerPreferenceValues = (
  preferences: ScanConfigPreference[] = [],
) => {
  const values: ScanConfigPreferenceValues = {};

  preferences.forEach(preference => {
    values[preference.name as string] = preference.value;
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
 * @param query - The search query.
 * @param items - The list of items to filter.
 * @param setFilteredItems - The function to update the filtered items state.
 * @param getItemName - The function to get the name property from an item.
 */
export const handleSearchChange = <TItem,>(
  query: string,
  items: TItem[],
  setFilteredItems: (items: TItem[]) => void,
  getItemName: (item: TItem) => string,
) => {
  const filtered = items.filter(item =>
    getItemName(item).toLowerCase().includes(query.toLowerCase()),
  );

  setFilteredItems(filtered);
};

const BasicFieldsContainer = memo(
  ({initialName, initialComment, syncDataRef}: BasicFieldsContainerProps) => {
    const [_] = useTranslation();
    const [name, setName] = useState(initialName);
    const [comment, setComment] = useState(initialComment);

    const valuesRef = useRef({name, comment});

    useEffect(() => {
      valuesRef.current = {name, comment};
    }, [name, comment]);

    useEffect(() => {
      syncDataRef(valuesRef);
    }, [syncDataRef]);

    return (
      <>
        <TextField
          name="name"
          title={_('Name')}
          value={name}
          onChange={value => setName(value)}
        />
        <TextField
          name="comment"
          title={_('Comment')}
          value={comment}
          onChange={value => setComment(value)}
        />
      </>
    );
  },
);

const ScanConfigEditDialog = ({
  comment = '',
  configId,
  configFamilies = {},
  configFamiliesTrend,
  configIsInUse = false,
  editNvtDetailsTitle,
  editNvtFamiliesTitle,
  error,
  families,
  isLoadingConfig = true,
  isLoadingFamilies = true,
  isLoadingScanners = true,
  name,
  nvtPreferences,
  scannerPreferences,
  scannerId,
  title,
  usageType = 'scan',
  onClose,
  onEditConfigFamilyClick,
  onEditNvtDetailsClick,
  onSave,
}: ScanConfigEditDialogProps) => {
  const [_] = useTranslation();
  const [scannerPreferenceValues, dispatch] = useReducer(
    reducer,
    createScannerPreferenceValues(scannerPreferences),
  );
  const [trendValues, setTrendValues] = useState<ScanConfigFamilyTrends>();
  const [selectValues, setSelectValues] = useState<ScanConfigNvtsSelected>();
  const [filteredFamilies, setFilteredFamilies] = useState(families ?? []);
  const [filteredScannerPreferences, setFilteredScannerPreferences] = useState(
    scannerPreferences ?? [],
  );
  const [filteredNvtPreferences, setFilteredNvtPreferences] = useState(
    nvtPreferences ?? [],
  );
  const basicFieldsRef: React.MutableRefObject<SyncDataRef | null> =
    useRef<SyncDataRef>(null);

  useEffect(() => {
    dispatch({
      type: 'setAll',
      formValues: createScannerPreferenceValues(scannerPreferences),
    });
  }, [scannerPreferences]);

  useEffect(() => {
    setFilteredFamilies(families ?? []);
  }, [families]);

  useEffect(() => {
    setFilteredScannerPreferences(scannerPreferences ?? []);
  }, [scannerPreferences]);

  useEffect(() => {
    setFilteredNvtPreferences(nvtPreferences ?? []);
  }, [nvtPreferences]);

  // trend and select are created only once and only after the whole config is loaded
  if (!isDefined(trendValues) && !isDefined(selectValues) && !isLoadingConfig) {
    const {trend, select} = createTrendAndSelect(configFamilies, families);
    setTrendValues(trend);
    setSelectValues(select);
  }

  const uncontrolledData = {
    scannerId,
  };

  const controlledData = {
    id: configId,
    scannerPreferenceValues,
    select: selectValues,
    trend: trendValues,
    familyTrend: configFamiliesTrend,
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
        families ?? [],
        setFilteredFamilies,
        item => item.name,
      );
      handleSearchChange(
        query,
        scannerPreferences ?? [],
        setFilteredScannerPreferences,
        item => item.name as string,
      );
      handleSearchChange(
        query,
        nvtPreferences ?? [],
        setFilteredNvtPreferences,
        item => item.nvt?.name as string,
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

  const handleSave = (
    values: ScanConfigEditDialogValues & ScanConfigEditDialogDefaultValues,
  ) => {
    const basicFields: SyncData = basicFieldsRef.current
      ? basicFieldsRef.current.current
      : {};

    const allValues = {
      ...values,
      name: basicFields.name as string,
      comment: basicFields.comment as string,
    };

    onSave(allValues);
  };

  const syncDataRef = useCallback((ref: SyncDataRef) => {
    basicFieldsRef.current = ref;
  }, []);

  return (
    <SaveDialog<ScanConfigEditDialogValues, ScanConfigEditDialogDefaultValues>
      defaultValues={uncontrolledData}
      error={error}
      title={title}
      values={controlledData}
      width="900px"
      onClose={onClose}
      onSave={handleSave}
    >
      {({values: state, onValueChange}) => (
        <>
          <BasicFieldsContainer
            initialComment={comment}
            initialName={name}
            syncDataRef={syncDataRef}
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
                <ScanConfigNvtFamilies
                  configFamilies={configFamilies}
                  editTitle={editNvtFamiliesTitle}
                  families={filteredFamilies}
                  select={selectValues as ScanConfigNvtsSelected}
                  trend={trendValues as ScanConfigFamilyTrends}
                  onEditConfigFamilyClick={onEditConfigFamilyClick}
                  onValueChange={onValueChange}
                />
              )}
              {isLoadingConfig ? (
                <Loading />
              ) : (
                <ScanConfigScannerPreferences
                  preferences={filteredScannerPreferences}
                  values={scannerPreferenceValues}
                  onValuesChange={dispatch}
                />
              )}

              {isLoadingConfig ? (
                <Loading />
              ) : (
                <MemoizedNvtPreferences
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

export default ScanConfigEditDialog;
