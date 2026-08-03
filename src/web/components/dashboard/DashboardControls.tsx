/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {connect} from 'react-redux';
import type Gmp from 'gmp/gmp';
import {type TranslateFunc} from 'gmp/locale';
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
import type {I18n} from 'web/hooks/useTranslation';
import {
  resetSettings,
  saveSettings,
} from 'web/store/dashboard/settings/actions';
import getDashboardSettings from 'web/store/dashboard/settings/selectors';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/prop-types';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

export type OnNewDisplay = (
  settings: DashboardSettings | undefined,
  dashboardId: string,
  displayId: string,
) => void;

interface DashboardControlsProps {
  _: TranslateFunc;
  canAdd: boolean;
  dashboardId: string;
  displayRegistry?: DisplayRegistry;
  displayIds?: string[];
  i18n: I18n;
  settings?: DashboardSettings;
  onNewDisplay: OnNewDisplay;
  onResetClick: (dashboardId: string) => void;
}

interface DashboardControlsState {
  showNewDialog: boolean;
}

interface NewDisplayValues {
  displayId: string;
}

export class DashboardControls extends React.Component<
  DashboardControlsProps,
  DashboardControlsState
> {
  static propTypes = {
    canAdd: PropTypes.bool.isRequired,
    dashboardId: PropTypes.id.isRequired,
    displayRegistry: PropTypes.object,
    displayIds: PropTypes.arrayOf(PropTypes.string),
    i18n: PropTypes.object.isRequired,
    settings: PropTypes.object,
    onNewDisplay: PropTypes.func.isRequired,
    onResetClick: PropTypes.func.isRequired,
    _: PropTypes.func.isRequired,
  };

  constructor(props: DashboardControlsProps) {
    super(props);

    this.state = {
      showNewDialog: false,
    };

    this.handleNewClick = this.handleNewClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleNewDialogClose = this.handleNewDialogClose.bind(this);
    this.handleNewDisplay = this.handleNewDisplay.bind(this);
  }

  handleResetClick() {
    const {dashboardId, onResetClick} = this.props;

    if (isDefined(onResetClick)) {
      onResetClick(dashboardId);
    }
  }

  handleNewClick() {
    this.setState({showNewDialog: true});
  }

  closeNewDialog() {
    this.setState({showNewDialog: false});
  }

  handleNewDialogClose() {
    this.closeNewDialog();
  }

  handleNewDisplay({displayId}: NewDisplayValues) {
    const {dashboardId, settings, onNewDisplay} = this.props;

    if (isDefined(onNewDisplay)) {
      this.closeNewDialog();

      onNewDisplay(settings, dashboardId, displayId);
    }
  }

  render() {
    const {_} = this.props;

    const {showNewDialog} = this.state;
    const {canAdd, displayIds = [], displayRegistry} = this.props;

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
            onClick={canAdd ? this.handleNewClick : undefined}
          />
          <ResetIcon
            data-testid="reset-dashboard"
            title={_('Reset to Defaults')}
            onClick={this.handleResetClick}
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
            onClose={this.handleNewDialogClose}
            onSave={this.handleNewDisplay}
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
  }
}

export const TranslatedDashboardControls = withTranslation(
  DashboardControls as React.ComponentType<DashboardControlsProps>,
);

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
  withTranslation,
  withGmp,
  connect(mapStateToProps, mapDispatchToProps as never),
)(DashboardControls as never);
