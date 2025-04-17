/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import MessageContainer from 'web/components/error/MessageContainer';
import {StNonAvailableIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout, {LayoutProps} from 'web/components/layout/Layout';

interface MessageProps extends LayoutProps {
  children?: React.ReactNode;
  'data-testid'?: string;
  details?: string;
  message: string;
}

const Message: React.FC<MessageProps> = ({
  message,
  details,
  children,
  'data-testid': dataTestId,
  ...props
}: MessageProps) => (
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

export default Message;
