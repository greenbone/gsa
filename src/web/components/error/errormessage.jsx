/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {AlertCircle} from 'lucide-react';
import React from 'react';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';


import ErrorContainer from './errorcontainer';

const ErrorMessage = ({
  message,
  details,
  children,
  'data-testid': dataTestId,
  ...props
}) => (
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

ErrorMessage.propTypes = {
  'data-testid': PropTypes.string,
  details: PropTypes.string,
  message: PropTypes.string,
};

export default ErrorMessage;
