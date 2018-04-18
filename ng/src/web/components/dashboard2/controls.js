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

import compose from '../../utils/compose.js';
import withGmp from '../../utils/withGmp.js';
import PropTypes from '../../utils/proptypes.js';

import IconDivider from '../layout/icondivider';

import NewIcon from '../icon/newicon';
import Icon from '../icon/icon';
import {resetSettings} from './settings/actions.js';

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
  }

  render() {
    return (
      <IconDivider>
        <NewIcon
          title={_('Add new Chart')}
          onClick={this.handleNewClick}
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
  dashboardId: PropTypes.id.isRequired,
  onResetClick: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onResetClick: (...args) => dispatch(resetSettings(ownProps)(...args)),
});

export default compose(
  withGmp,
  connect(undefined, mapDispatchToProps),
)(DashboardControls);


// vim: set ts=2 sw=2 tw=80:
