/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {connect} from 'react-redux';
import type Gmp from 'gmp/gmp';
import {isDefined} from 'gmp/utils/identity';
import {
  type DisplayRegistry,
  getDisplay,
} from 'web/components/dashboard/registry';
import {
  addDisplayToSettings,
  canAddDisplay,
  type DashboardSettings,
  getPermittedDisplayIds,
} from 'web/components/dashboard/utils';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import {NewIcon, ResetIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import useTranslation from 'web/hooks/useTranslation';
import {
  resetSettings,
  saveSettings,
} from 'web/store/dashboard/settings/actions';
import getDashboardSettings from 'web/store/dashboard/settings/selectors';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';

export type OnNewDisplayFunc = (
  settings: DashboardSettings | undefined,
  dashboardId: string,
  displayId: string,
) => void;

interface DashboardControlsProps {
  canAdd: boolean;
  dashboardId: string;
  displayRegistry?: DisplayRegistry;
  displayIds?: string[];
  settings?: DashboardSettings;
  onNewDisplay: OnNewDisplayFunc;
  onResetClick: (dashboardId: string) => void;
}

interface NewDisplayValues {
  displayId: string;
}

export const DashboardControls = ({
  canAdd,
  dashboardId,
  displayIds = [],
  displayRegistry,
  settings,
  onNewDisplay,
  onResetClick,
}: DashboardControlsProps) => {
  const [_] = useTranslation();
  const [showNewDialog, setShowNewDialog] = useState(false);

  const handleResetClick = () => {
    if (isDefined(onResetClick)) {
      onResetClick(dashboardId);
    }
  };

  const handleNewClick = () => {
    setShowNewDialog(true);
  };

  const closeNewDialog = () => {
    setShowNewDialog(false);
  };

  const handleNewDialogClose = () => {
    closeNewDialog();
  };

  const handleNewDisplay = ({displayId}: NewDisplayValues) => {
    if (isDefined(onNewDisplay)) {
      closeNewDialog();

      onNewDisplay(settings, dashboardId, displayId);
    }
  };

  const displays = displayIds
    .map(displayId => getDisplay(displayId, displayRegistry))
    .filter(isDefined);
  const firstDisplay = displays[0];
  const displayItems = displays.map(display => ({
    label: `${display.title}`,
    value: display.component.displayId,
  }));

  return (
    <>
      <IconDivider>
        <NewIcon
          active={canAdd}
          data-testid="add-dashboard-display"
          title={
            canAdd
              ? _('Add new Dashboard Display')
              : _('Dashboard limit reached')
          }
          onClick={canAdd ? handleNewClick : undefined}
        />
        <ResetIcon
          data-testid="reset-dashboard"
          title={_('Reset to Defaults')}
          onClick={handleResetClick}
        />
      </IconDivider>
      {showNewDialog && isDefined(firstDisplay) && (
        <SaveDialog<{}, NewDisplayValues>
          buttonTitle={_('Add')}
          defaultValues={{
            displayId: firstDisplay.component.displayId,
          }}
          title={_('Add new Dashboard Display')}
          width="660px"
          onClose={handleNewDialogClose}
          onSave={handleNewDisplay}
        >
          {({values, onValueChange}) => (
            <FormGroup title={_('Choose Display')}>
              <Select
                items={displayItems}
                name="displayId"
                value={values.displayId}
                width="auto"
                onChange={onValueChange}
              />
            </FormGroup>
          )}
        </SaveDialog>
      )}
    </>
  );
};

const mapStateToProps = (
  rootState: unknown,
  {dashboardId}: {dashboardId: string},
) => {
  const settingsSelector = getDashboardSettings(rootState);
  const settings = settingsSelector.getById(dashboardId);
  return {
    canAdd: canAddDisplay(settings),
    displayIds: getPermittedDisplayIds(settings),
    settings,
  };
};

const addDisplay =
  (gmp: Gmp) =>
  (
    settings: DashboardSettings | undefined,
    dashboardId: string,
    displayId: string,
  ) => {
    const newSettings = addDisplayToSettings(settings, displayId);
    return saveSettings(gmp)(dashboardId, newSettings);
  };

const mapDispatchToProps = (
  dispatch: (action: unknown) => unknown,
  {gmp}: {gmp: Gmp},
) => ({
  onResetClick: (dashboardId: string) =>
    dispatch(resetSettings(gmp)(dashboardId)),
  onNewDisplay: (
    settings: Record<string, unknown>,
    dashboardId: string,
    displayId: string,
  ) =>
    dispatch(
      addDisplay(gmp)(settings as DashboardSettings, dashboardId, displayId),
    ),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps as never),
)(DashboardControls as never);
