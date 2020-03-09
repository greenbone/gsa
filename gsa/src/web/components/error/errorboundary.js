/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import ErrorPanel from './errorpanel';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {hasError: false};
  }

  componentDidCatch(error, info) {
    this.setState({
      hasError: true,
      error,
      info,
    });
  }

  render() {
    const {hasError, error, info} = this.state;
    const {message = _('An error occurred on this page.')} = this.props;

    if (hasError) {
      return <ErrorPanel error={error} info={info} message={message} />;
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  message: PropTypes.string,
};

export default ErrorBoundary;

// vim: set ts=2 sw=2 tw=80:
