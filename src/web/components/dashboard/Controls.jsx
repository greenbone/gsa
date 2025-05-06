/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import {getDisplay} from 'web/components/dashboard/Registry';
import {
  addDisplayToSettings,
  canAddDisplay,
  getPermittedDisplayIds,
} from 'web/components/dashboard/Utils';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import {NewIcon, ResetIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import {
  resetSettings,
  saveSettings,
} from 'web/store/dashboard/settings/actions';
import getDashboardSettings from 'web/store/dashboard/settings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

class DashboardControls extends React.Component {
  constructor(...args) {
    super(...args);

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

    this.handleInteraction();
  }

  handleNewClick() {
    this.setState({showNewDialog: true});
    this.handleInteraction();
  }

  closeNewDialog() {
    this.setState({showNewDialog: false});
  }

  handleNewDialogClose() {
    this.closeNewDialog();
    this.handleInteraction();
  }

  handleNewDisplay({displayId}) {
    const {dashboardId, settings, onNewDisplay} = this.props;

    if (isDefined(onNewDisplay)) {
      this.closeNewDialog();

      onNewDisplay(settings, dashboardId, displayId);

      this.handleInteraction();
    }
  }

  handleInteraction() {
    const {onInteraction} = this.props;

    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {_} = this.props;

    const {showNewDialog} = this.state;
    const {canAdd, displayIds = []} = this.props;

    const displays = displayIds
      .map(displayId => getDisplay(displayId))
      .filter(isDefined);
    const displayItems = displays.map(display => ({
      label: `${display.title}`,
      value: display.displayId,
    }));
    return (
      <React.Fragment>
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
        {showNewDialog && (
          <SaveDialog
            buttonTitle={_('Add')}
            defaultValues={{
              displayId: first(displays).displayId,
            }}
            minHeight={163}
            title={_('Add new Dashboard Display')}
            width="660px"
            onClose={this.handleNewDialogClose}
            onSave={this.handleNewDisplay}
          >
            {({values, onValueChange}) => (
              <FormGroup title={_('Choose Display')} titleSize={3}>
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
      </React.Fragment>
    );
  }
}

export const TranslatedDashboardControls = withTranslation(DashboardControls);

DashboardControls.propTypes = {
  canAdd: PropTypes.bool.isRequired,
  dashboardId: PropTypes.id.isRequired,
  displayIds: PropTypes.arrayOf(PropTypes.string),
  settings: PropTypes.object,
  onInteraction: PropTypes.func,
  onNewDisplay: PropTypes.func.isRequired,
  onResetClick: PropTypes.func.isRequired,
  _: PropTypes.func.isRequired,
};

const mapStateToProps = (rootState, {dashboardId}) => {
  const settingsSelector = getDashboardSettings(rootState);
  const settings = settingsSelector.getById(dashboardId);
  return {
    canAdd: canAddDisplay(settings),
    displayIds: getPermittedDisplayIds(settings),
    settings,
  };
};

const addDisplay = gmp => (settings, dashboardId, displayId) => {
  const newSettings = addDisplayToSettings(settings, displayId);
  return saveSettings(gmp)(dashboardId, newSettings);
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  onResetClick: dashboardId => dispatch(resetSettings(gmp)(dashboardId)),
  onNewDisplay: (settings, dashboardId, displayId) =>
    dispatch(addDisplay(gmp)(settings, dashboardId, displayId)),
});

export default compose(
  withTranslation,
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(DashboardControls);
