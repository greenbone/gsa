/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import ErrorPanel from 'web/components/error/ErrorPanel';
import PropTypes from 'web/utils/PropTypes';
import withTranslation from 'web/utils/withTranslation';

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
    const {_} = this.props;

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
  _: PropTypes.func.isRequired,
};

export default withTranslation(ErrorBoundary);
