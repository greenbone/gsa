/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import {setIsLoggedIn} from './store/usersettings/actions';
import {isLoggedIn} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

class Authorized extends React.Component {
  constructor(...args) {
    super(...args);

    this.responseError = this.responseError.bind(this);
  }

  componentDidMount() {
    const {gmp} = this.props;

    this.responseError = this.responseError.bind(this);

    this.unsubscribe = gmp.addHttpErrorHandler(this.responseError);

    this.checkIsLoggedIn();
  }

  componentWillUnmount() {
    if (isDefined(this.unsubscribe)) {
      this.unsubscribe();
    }
  }

  componentDidUpdate() {
    this.checkIsLoggedIn();
  }

  responseError(xhr) {
    const {logout} = this.props;

    if (xhr.status === 401) {
      logout();
      return Promise.resolve(xhr);
    }
    return Promise.reject(xhr);
  }

  checkIsLoggedIn() {
    if (!this.props.isLoggedIn) {
      this.toLoginPage();
    }
  }

  toLoginPage() {
    const {history, location} = this.props;

    if (location.pathname === '/login') {
      // already at login page
      return;
    }

    history.replace('/login', {
      next: this.props.location.pathname,
    });
  }

  render() {
    return this.props.isLoggedIn ? this.props.children : null;
  }
}

Authorized.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  history: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = rootState => ({
  isLoggedIn: isLoggedIn(rootState),
});

const mapDispatchToProps = (dispatch, {gmp}) => ({
  logout: () => {
    gmp.logout();
    dispatch(setIsLoggedIn(false));
  },
});

export default compose(
  withGmp,
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Authorized);

// vim: set ts=2 sw=2 tw=80:
