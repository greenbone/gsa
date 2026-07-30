/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {Button as OpenSightButton} from '@greenbone/ui-lib';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import ErrorMessage from 'web/components/error/ErrorMessage';
import Divider from 'web/components/layout/Divider';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

interface ErrorPanelProps {
  error?: Error;
  info?: {
    componentStack: string;
  };
  message: string;
}

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

const ErrorPanel = ({error, message, info}: ErrorPanelProps) => {
  const [_] = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails(show => !show);
  };
  return (
    <ErrorMessage
      details={_('Please try again.')}
      flex="column"
      message={message}
    >
      {isDefined(error) && (
        <OpenSightButton
          data-testid="errorpanel-toggle"
          size="sm"
          variant="danger"
          onClick={handleToggleDetails}
        >
          {showDetails ? _('Hide Error Details') : _('Show Error Details')}
        </OpenSightButton>
      )}
      {isDefined(error) && showDetails && (
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

export default ErrorPanel;
