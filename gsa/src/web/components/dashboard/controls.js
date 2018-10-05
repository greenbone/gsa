/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import {
  addDisplay,
  resetSettings,
} from 'web/store/dashboard/settings/actions';
import getDashboardSettings from 'web/store/dashboard/settings/selectors';
import {canAddDisplay} from 'web/store/dashboard/settings/utils';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import NewIcon from 'web/components/icon/newicon';
import Icon from 'web/components/icon/icon';

import IconDivider from 'web/components/layout/icondivider';

import {getDisplay} from './registry';

export class DashboardControls extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      showNewDialog: false,
    };

    this.handleNewClick = this.handleNewClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleNewDialoClose = this.handleNewDialoClose.bind(this);
    this.handleNewDisplay = this.handleNewDisplay.bind(this);
  }

  handleResetClick() {
    const {
      dashboardId,
      onResetClick,
    } = this.props;

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

  handleNewDialoClose() {
    this.closeNewDialog();
    this.handleInteraction();
  }

  handleNewDisplay({displayId}) {
    const {
      dashboardId,
      onNewDisplay,
    } = this.props;

    if (isDefined(onNewDisplay)) {
      this.closeNewDialog();

      onNewDisplay(dashboardId, displayId);

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

    const displays = displayIds.map(name =>
      getDisplay(name)).filter(isDefined);
    const displayItems = displays.map(display => ({
      label: `${display.title}`,
      value: display.id,
    }));
    return (
      <React.Fragment>
        <IconDivider>
          <NewIcon
            active={canAdd}
            title={
              canAdd ?
                _('Add new Dashboard Display') :
                _('Dashboard limit reached')
            }
            onClick={canAdd ? this.handleNewClick : undefined}
          />
          <Icon
            img="first.svg"
            title={_('Reset to Defaults')}
            onClick={this.handleResetClick}
          />
        </IconDivider>
        {showNewDialog &&
          <SaveDialog
            title={_('Add new Dashboard Display')}
            buttonTitle={_('Add')}
            minHeight={163}
            width="500px"
            defaultValues={{
              displayId: first(displays).id,
            }}
            onClose={this.handleNewDialoClose}
            onSave={this.handleNewDisplay}
          >
            {({values, onValueChange}) => (
              <FormGroup
                title={_('Choose Display')}
                titleSize={4}
              >
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
        }
      </React.Fragment>
    );
  }
}

DashboardControls.propTypes = {
  canAdd: PropTypes.bool.isRequired,
  dashboardId: PropTypes.id.isRequired,
  displayIds: PropTypes.arrayOf(PropTypes.string),
  onInteraction: PropTypes.func,
  onNewDisplay: PropTypes.func.isRequired,
  onResetClick: PropTypes.func.isRequired,
};

const mapStateToProps = (rootState, {dashboardId}) => {
  const settingsSelector = getDashboardSettings(rootState);
  const settings = settingsSelector.getById(dashboardId);
  const {permittedDisplays: displayIds} = settings || {};
  return {
    canAdd: canAddDisplay(settings),
    displayIds,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  onResetClick: (...args) => dispatch(resetSettings(gmp)(...args)),
  onNewDisplay: (...args) => dispatch(addDisplay(gmp)(...args)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(DashboardControls);


// vim: set ts=2 sw=2 tw=80:
