/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {type FilterType} from 'gmp/models/filter';
import DashboardView, {
  DEFAULT_MAX_ITEMS_PER_ROW,
  DEFAULT_MAX_ROWS,
} from 'web/components/dashboard/DashboardView';
import {type DashboardSettings} from 'web/components/dashboard/utils';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import {
  loadSettings,
  saveSettings,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';
import DashboardSettingsSelector from 'web/store/dashboard/settings/selectors';

interface DashboardProps {
  defaultDisplays?: string[][];
  filter?: FilterType;
  id: string;
  maxItemsPerRow?: number;
  maxRows?: number;
  permittedDisplays: string[];
  showFilterSelection?: boolean;
  showFilterString?: boolean;
  notify?: (message: string) => void;
  onFilterChanged?: (filter: FilterType) => void;
}

export {DEFAULT_MAX_ITEMS_PER_ROW, DEFAULT_MAX_ROWS};

const Dashboard = ({
  defaultDisplays,
  filter,
  id,
  maxItemsPerRow = DEFAULT_MAX_ITEMS_PER_ROW,
  maxRows = DEFAULT_MAX_ROWS,
  permittedDisplays,
  showFilterSelection = false,
  showFilterString = false,
  notify,
  onFilterChanged,
}: DashboardProps) => {
  const gmp = useGmp();
  const dispatch = useDispatch();

  const isLoading = useShallowEqualSelector(state => {
    const selector = DashboardSettingsSelector(state);
    return selector.getIsLoading(id);
  });
  const error = useShallowEqualSelector(state => {
    const selector = DashboardSettingsSelector(state);
    return selector.getError(id);
  });
  const settings = useShallowEqualSelector(state => {
    const selector = DashboardSettingsSelector(state);
    return selector.getById(id);
  });

  const loadSettingsFunc = useCallback(
    (dashboardId: string, defaults: DashboardSettings) => {
      // @ts-expect-error
      dispatch(loadSettings(gmp)(dashboardId, defaults));
    },
    [dispatch, gmp],
  );
  const setDefaultSettingsFunc = useCallback(
    (dashboardId: string, dashboardSettings: DashboardSettings) =>
      dispatch(setDashboardSettingDefaults(dashboardId, dashboardSettings)),
    [dispatch],
  );
  const saveSettingsFunc = useCallback(
    (dashboardId: string, dashboardSettings: DashboardSettings) => {
      // @ts-expect-error
      dispatch(saveSettings(gmp)(dashboardId, dashboardSettings));
    },
    [dispatch, gmp],
  );

  return (
    <DashboardView
      defaultDisplays={defaultDisplays}
      error={error}
      filter={filter}
      id={id}
      isLoading={isLoading}
      loadSettings={loadSettingsFunc}
      maxItemsPerRow={maxItemsPerRow}
      maxRows={maxRows}
      notify={notify}
      permittedDisplays={permittedDisplays}
      saveSettings={saveSettingsFunc}
      setDefaultSettings={setDefaultSettingsFunc}
      settings={settings}
      showFilterSelection={showFilterSelection}
      showFilterString={showFilterString}
      onFilterChanged={onFilterChanged}
    />
  );
};

export default Dashboard;
