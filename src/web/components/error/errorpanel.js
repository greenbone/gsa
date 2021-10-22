/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import React, {useState} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

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
  overflow-x: auto;
`;

const ErrorPanel = ({error, message, info}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails(show => !show);
  };
  return (
    <ErrorMessage
      message={message}
      details={_('Please try again.')}
      flex="column"
    >
      {isDefined(error) && (
        <ErrorDetailsToggle
          data-testid="errorpanel-toggle"
          onClick={handleToggleDetails}
        >
          {showDetails ? _('Hide Error Details') : _('Show Error Details')}
        </ErrorDetailsToggle>
      )}
      {showDetails && (
        <ErrorDetails>
          <Divider flex="column">
            <h3 data-testid="errorpanel-heading">
              {error.name}: {error.message}
            </h3>
            {isDefined(info) && (
              <pre data-testid="errorpanel-component-stack">
                {info.componentStack}
              </pre>
            )}
            <pre data-testid="errorpanel-error-stack">{error.stack}</pre>
          </Divider>
        </ErrorDetails>
      )}
    </ErrorMessage>
  );
};

ErrorPanel.propTypes = {
  error: PropTypes.error,
  info: PropTypes.shape({
    componentStack: PropTypes.string,
  }),
  message: PropTypes.string.isRequired,
};

export default ErrorPanel;
