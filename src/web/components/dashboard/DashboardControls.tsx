/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {isDefined} from 'gmp/utils/identity';
import {
  type DisplayRegistry,
  getDisplay,
} from 'web/components/dashboard/registry';
import {type DashboardSettings} from 'web/components/dashboard/utils';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import {NewIcon, ResetIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import useTranslation from 'web/hooks/useTranslation';

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

const DashboardControls = ({
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

export default DashboardControls;
