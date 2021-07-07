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

import {withRouter} from 'react-router-dom';

import Logger from 'gmp/log';

import {renewSessionTimeout} from 'web/store/usersettings/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

const log = Logger.getLogger('web.observer.locationobserver');

const locationChanged = (loc, prevLoc) =>
  loc.pathname !== prevLoc.pathname || loc.search !== prevLoc.search;

class LocationObserver extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      location: this.props.location,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (locationChanged(props.location, state.location)) {
      return {
        location: props.location,
        locationHasChanged: true,
      };
    }
    return {
      locationHasChanged: false,
    };
  }

  componentDidMount() {
    // init session timeout in store
    // this is necessary for page reloads
    this.props.renewSessionTimeout();
  }

  componentDidUpdate() {
    if (this.state.locationHasChanged) {
      log.debug('Location has changed. Renewing session.');

      this.props.renewSessionTimeout();
    }
  }

  render() {
    return this.props.children;
  }
}

LocationObserver.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  location: PropTypes.object.isRequired,
  renewSessionTimeout: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
  withRouter,
  connect(
    undefined,
    (dispatch, {gmp}) => ({
      renewSessionTimeout: () => dispatch(renewSessionTimeout(gmp)()),
    }),
  ),
)(LocationObserver);

// vim: set ts=2 sw=2 tw=80:
