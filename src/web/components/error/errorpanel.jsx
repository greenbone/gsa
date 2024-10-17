/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import ErrorMessage from './errormessage';
import {Button as OpenSightButton} from '@greenbone/opensight-ui-components-mantinev7';

const ErrorDetails = styled.div`
  margin-top: 10px;
  border: 1px solid ${Theme.mediumLightRed};
  background-color: ${Theme.white};
  padding: 5px;
  max-height: 200px;
  overflow-x: auto;
`;

const StyledPre = styled.pre`
  word-break: break-word;
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
        <OpenSightButton
          variant="danger"
          size="sm"
          data-testid="errorpanel-toggle"
          onClick={handleToggleDetails}
        >
          {showDetails ? _('Hide Error Details') : _('Show Error Details')}
        </OpenSightButton>
      )}
      {showDetails && (
        <ErrorDetails>
          <Divider flex="column">
            <h3 data-testid="errorpanel-heading">
              {error.name}: {error.message}
            </h3>
            {isDefined(info) && (
              <StyledPre data-testid="errorpanel-component-stack">
                {info.componentStack}
              </StyledPre>
            )}
            <StyledPre data-testid="errorpanel-error-stack">
              {error.stack}
            </StyledPre>
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
