/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import ErrorContainer from 'web/components/error/ErrorContainer';
import {AlertCircleIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout, {type LayoutProps} from 'web/components/layout/Layout';
import Theme from 'web/utils/Theme';

interface ErrorMessageProps extends LayoutProps {
  children?: React.ReactNode;
  'data-testid'?: string;
  details?: string;
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  details,
  children,
  'data-testid': dataTestId,
  ...props
}: ErrorMessageProps) => (
  <ErrorContainer data-testid={dataTestId}>
    <Divider grow align={['center', 'center']} flex="column" margin="20px">
      <AlertCircleIcon color={Theme.darkRed} size="medium" />
      <Layout align={['center', 'center']} flex="column" {...props}>
        <b data-testid="error-message">{message}</b>
        <Divider grow align={['center', 'start']} flex="row" margin="20px">
          {isDefined(details) && (
            <div>
              <span data-testid="error-details">{details}</span>
            </div>
          )}
        </Divider>
        {children}
      </Layout>
    </Divider>
  </ErrorContainer>
);

export default ErrorMessage;
