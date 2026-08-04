/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useDispatch} from 'react-redux';
import DashboardControls, {
  type OnNewDisplayFunc,
} from 'web/components/dashboard/DashboardControls';
import type {DisplayRegistry} from 'web/components/dashboard/registry';
import {
  addDisplayToSettings,
  canAddDisplay,
  getPermittedDisplayIds,
} from 'web/components/dashboard/utils';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import {
  resetSettings,
  saveSettings,
} from 'web/store/dashboard/settings/actions';
import getDashboardSettings from 'web/store/dashboard/settings/selectors';

interface DashboardControlsContainerProps {
  dashboardId: string;
  displayRegistry?: DisplayRegistry;
}

const DashboardControlsContainer = ({
  dashboardId,
  displayRegistry,
}: DashboardControlsContainerProps) => {
  const gmp = useGmp();
  const dispatch = useDispatch();

  const settingsSelector = useShallowEqualSelector(getDashboardSettings);
  const settings = settingsSelector.getById(dashboardId);

  const handleResetClick = (targetDashboardId: string) => {
    // @ts-expect-error redux thunk action
    dispatch(resetSettings(gmp)(targetDashboardId));
  };

  const handleNewDisplay: OnNewDisplayFunc = (
    currentSettings,
    targetDashboardId,
    displayId,
  ) => {
    const newSettings = addDisplayToSettings(currentSettings, displayId);
    // @ts-expect-error redux thunk action
    dispatch(saveSettings(gmp)(targetDashboardId, newSettings));
  };

  return (
    <DashboardControls
      canAdd={canAddDisplay(settings)}
      dashboardId={dashboardId}
      displayIds={getPermittedDisplayIds(settings)}
      displayRegistry={displayRegistry}
      settings={settings}
      onNewDisplay={handleNewDisplay}
      onResetClick={handleResetClick}
    />
  );
};

export default DashboardControlsContainer;
