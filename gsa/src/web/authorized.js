/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {withRouter} from 'react-router-dom';

import {isDefined} from 'gmp/utils/identity';

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
  }

  componentWillUnmount() {
    if (isDefined(this.unsubscribe)) {
      this.unsubscribe();
    }
  }

  responseError(xhr) {
    const {location} = this.props;

    if (xhr.status === 401 && location.pathname !== '/login') {
      this.toLoginPage();
      return Promise.resolve(xhr);
    }
    return Promise.reject(xhr);
  }

  toLoginPage() {
    const {gmp, history} = this.props;

    gmp.clearToken(); // ensure gmp.isLoggedIn returns false

    history.replace('/login', {
      next: this.props.location.pathname,
    });

    gmp.logout();
  }

  render() {
    const {gmp} = this.props;

    if (gmp.isLoggedIn()) {
      return this.props.children;
    }

    this.toLoginPage();

    return null;
  }
}

Authorized.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default compose(
  withGmp,
  withRouter,
)(Authorized);

// vim: set ts=2 sw=2 tw=80:
