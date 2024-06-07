/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import StNonAvailableIcon from 'web/components/icon/stnonavailableicon';

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
    <Divider margin="15px" align={['start', 'start']}>
      <StNonAvailableIcon size="medium" />
      <Layout {...props}>
        <Divider>
          <b data-testid="error-message">{message}</b>
          {isDefined(details) && (
            <span data-testid="error-details">{details}</span>
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
