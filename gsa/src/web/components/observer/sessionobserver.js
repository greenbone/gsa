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

import {withRouter} from 'react-router-dom';

import Logger from 'gmp/log';

import {setSessionTimeout} from 'web/store/usersettings/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

const log = Logger.getLogger('web.observer.sessionobserver');

class SessionObserver extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      location: this.props.location,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.location !== state.location) {
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
    this.renewSession();
  }

  componentDidUpdate() {
    if (this.state.locationHasChanged) {
      log.debug('Location has changed. Renewing session.');

      this.renewSession();
    }
  }

  renewSession() {
    const {gmp} = this.props;

    gmp.user.renewSession().then(response => {
      this.props.setSessionTimeout(response.data);
    });
  }

  render() {
    return this.props.children;
  }
}

SessionObserver.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  location: PropTypes.object.isRequired,
  setSessionTimeout: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
  withRouter,
  connect(undefined, {setSessionTimeout}),
)(SessionObserver);

// vim: set ts=2 sw=2 tw=80:
