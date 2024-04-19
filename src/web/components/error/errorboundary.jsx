/* Copyright (C) 2018-2022 Greenbone AG
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

import * as Sentry from '@sentry/react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

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

    if (isDefined(error)) {
      Sentry.withScope(scope => {
        Object.keys(info).forEach(key => {
          scope.setExtra(key, info[key]);
        });
        Sentry.captureException(error);
      });
    }
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
