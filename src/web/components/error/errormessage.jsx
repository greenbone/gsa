/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import {AlertCircle} from 'lucide-react';
import Theme from 'web/utils/theme';

import PropTypes from 'web/utils/proptypes';

import ErrorContainer from './errorcontainer';

const ErrorMessage = ({
  message,
  details,
  children,
  'data-testid': dataTestId,
  ...props
}) => (
  <ErrorContainer data-testid={dataTestId}>
    <Divider margin="20px" flex="column" align={['center', 'center']} grow>
      <AlertCircle size="24" color={Theme.darkRed} />
      <Layout flex="column" align={['center', 'center']} {...props}>
        <b data-testid="error-message">{message}</b>
        <Divider margin="20px" flex="row" align={['center', 'start']} grow>
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
