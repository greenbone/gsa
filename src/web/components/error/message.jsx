/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import StNonAvailableIcon from 'web/components/icon/stnonavailableicon';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';
import PropTypes from 'web/utils/proptypes';

import MessageContainer from './messagecontainer';

const Message = ({
  message,
  details,
  children,
  'data-testid': dataTestId,
  ...props
}) => (
  <MessageContainer data-testid={dataTestId}>
    <Divider align={['start', 'start']} margin="15px">
      <StNonAvailableIcon size="medium" />
      <Layout {...props}>
        <Divider>
          <b data-testid="message">{message}</b>
          {isDefined(details) && (
            <span data-testid="message-details">{details}</span>
          )}
        </Divider>
        {children}
      </Layout>
    </Divider>
  </MessageContainer>
);

Message.propTypes = {
  'data-testid': PropTypes.string,
  details: PropTypes.string,
  message: PropTypes.string,
};

export default Message;
