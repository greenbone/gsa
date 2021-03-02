/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import NewIcon from 'web/components/icon/newicon';
import ResetIcon from 'web/components/icon/reseticon';

import IconDivider from 'web/components/layout/icondivider';

import {
  resetSettings,
  saveSettings,
} from 'web/store/dashboard/settings/actions';
import getDashboardSettings from 'web/store/dashboard/settings/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import {getDisplay} from './registry';
import {
  addDisplayToSettings,
  canAddDisplay,
  getPermittedDisplayIds,
} from './utils';

export class DashboardControls extends React.Component {
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
            title={
              canAdd
                ? _('Add new Dashboard Display')
                : _('Dashboard limit reached')
            }
            onClick={canAdd ? this.handleNewClick : undefined}
          />
          <ResetIcon
            title={_('Reset to Defaults')}
            onClick={this.handleResetClick}
          />
        </IconDivider>
        {showNewDialog && (
          <SaveDialog
            title={_('Add new Dashboard Display')}
            buttonTitle={_('Add')}
            minHeight={163}
            width="660px"
            defaultValues={{
              displayId: first(displays).displayId,
            }}
            onClose={this.handleNewDialogClose}
            onSave={this.handleNewDisplay}
          >
            {({values, onValueChange}) => (
              <FormGroup title={_('Choose Display')} titleSize={3}>
                <Select
                  name="displayId"
                  items={displayItems}
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

DashboardControls.propTypes = {
  canAdd: PropTypes.bool.isRequired,
  dashboardId: PropTypes.id.isRequired,
  displayIds: PropTypes.arrayOf(PropTypes.string),
  settings: PropTypes.object,
  onInteraction: PropTypes.func,
  onNewDisplay: PropTypes.func.isRequired,
  onResetClick: PropTypes.func.isRequired,
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
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(DashboardControls);

// vim: set ts=2 sw=2 tw=80:
