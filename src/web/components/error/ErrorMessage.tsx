/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {AlertCircle} from 'lucide-react';
import React from 'react';
import ErrorContainer from 'web/components/error/ErrorContainer';
import Divider from 'web/components/layout/Divider';
import Layout, {LayoutProps} from 'web/components/layout/Layout';
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
      <AlertCircle color={Theme.darkRed} size="24" />
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
