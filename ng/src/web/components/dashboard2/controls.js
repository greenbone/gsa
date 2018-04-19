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

import {is_defined, has_value} from 'gmp/utils/identity';

import compose from '../../utils/compose.js';
import withGmp from '../../utils/withGmp.js';
import PropTypes from '../../utils/proptypes.js';

import IconDivider from '../layout/icondivider';

import NewIcon from '../icon/newicon';
import Icon from '../icon/icon';
import {resetSettings, addDefaultDisplay} from './settings/actions';
import getDashboardSettings from './settings/selectors';

class DashboardControls extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleNewClick = this.handleNewClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
  }

  handleResetClick() {
    const {
      dashboardId,
      onResetClick,
    } = this.props;

    onResetClick(dashboardId);
  }

  handleNewClick() {
    const {
      dashboardId,
      onNewClick,
    } = this.props;

    onNewClick(dashboardId);
  }

  render() {
    const {canAdd} = this.props;
    return (
      <IconDivider>
        <NewIcon
          active={canAdd}
          title={canAdd ? _('Add new Chart') : _('Dashboard limit reached')}
          onClick={canAdd ? this.handleNewClick : undefined}
        />
        <Icon
          img="first.svg"
          title={_('Reset to Defaults')}
          onClick={this.handleResetClick}
        />
      </IconDivider>
    );
  }
}

DashboardControls.propTypes = {
  canAdd: PropTypes.bool.isRequired,
  dashboardId: PropTypes.id.isRequired,
  onNewClick: PropTypes.func.isRequired,
  onResetClick: PropTypes.func.isRequired,
};

const canAdd = (items, {maxItemsPerRow, maxRows}) => {
  if (has_value(items) && is_defined(maxItemsPerRow) && is_defined(maxRows)) {
    const lastRow = items[items.length - 1];
    return lastRow.items.length < maxItemsPerRow || items.length < maxRows;
  }
  return true;
};

const mapStateToProps = (rootState, {dashboardId}) => {
  const settings = getDashboardSettings(rootState);
  const items = settings.getItemsById(dashboardId);
  const defaults = settings.getDefaultsById(dashboardId);
  return {
    canAdd: canAdd(items, defaults),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onResetClick: (...args) => dispatch(resetSettings(ownProps)(...args)),
  onNewClick: (...args) => dispatch(addDefaultDisplay(ownProps)(...args)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(DashboardControls);


// vim: set ts=2 sw=2 tw=80:
