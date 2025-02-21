/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Logger from 'gmp/log';
import React from 'react';
import {connect} from 'react-redux';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';
import {withRouter} from 'web/utils/withRouter';

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
  connect(undefined, (dispatch, {gmp}) => ({
    renewSessionTimeout: () => dispatch(renewSessionTimeout(gmp)()),
  })),
)(LocationObserver);
