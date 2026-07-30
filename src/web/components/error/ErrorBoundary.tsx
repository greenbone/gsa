/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import ErrorPanel from 'web/components/error/ErrorPanel';
import withTranslation, {
  type WithTranslationComponentProps,
} from 'web/utils/withTranslation';

interface ErrorBoundaryProps extends WithTranslationComponentProps {
  children?: React.ReactNode;
  message?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  info?: {componentStack: string};
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {hasError: false};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      info: {
        componentStack: info.componentStack ?? '',
      },
    });
  }

  render() {
    const {
      _,
      children,
      message = _('An error occurred on this page.'),
    } = this.props;
    const {hasError, error, info} = this.state;

    if (hasError) {
      return <ErrorPanel error={error} info={info} message={message} />;
    }
    return children;
  }
}

export default withTranslation(ErrorBoundary);
