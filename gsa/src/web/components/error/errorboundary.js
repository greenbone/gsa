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

import styled from 'styled-components';

import _ from 'gmp/locale';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import ErrorMessage from './errormessage';

const ErrorDetailsToggle = styled.span`
  margin-top: 10px;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

const ErrorDetails = styled.div`
  margin-top: 10px;
  border: 1px solid ${Theme.mediumLightRed};
  background-color: ${Theme.white};
  padding: 5px;
  max-height: 200px;
  overflow: auto;
  overflow-x: auto;
  white-space: pre;
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {hasError: false, showDetails: false};

    this.handleToggleDetails = this.handleToggleDetails.bind(this);
  }

  componentDidCatch(error, info) {
    this.setState({
      hasError: true,
      error,
      info,
    });
  }

  handleToggleDetails() {
    this.setState(({showDetails}) => ({showDetails: !showDetails}));
  }

  render() {
    const {hasError, showDetails, error, info} = this.state;
    const {message = _('An error occurred on this page.')} = this.props;

    if (hasError) {
      return (
        <ErrorMessage
          message={message}
          details={_('Please try again.')}
          flex="column"
        >
          <ErrorDetailsToggle
            data-testid="errorboundary-toggle"
            onClick={this.handleToggleDetails}
          >
            {showDetails ? _('Hide Error Details') : _('Show Error Details')}
          </ErrorDetailsToggle>
          {showDetails && (
            <ErrorDetails>
              <Divider flex="column">
                <h3 data-testid="errorboundary-heading">
                  {error.name}: {error.message}
                </h3>
                <pre data-testid="errorboundary-component-stack">
                  {info.componentStack}
                </pre>
                <pre data-testid="errorboundary-error-stack">{error.stack}</pre>
              </Divider>
            </ErrorDetails>
          )}
        </ErrorMessage>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  message: PropTypes.string,
};

export default ErrorBoundary;

// vim: set ts=2 sw=2 tw=80:
