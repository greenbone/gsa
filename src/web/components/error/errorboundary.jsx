/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
