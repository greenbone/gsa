/* Copyright (C) 2018-2022 Greenbone AG
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
import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import StNonAvailableIcon from 'web/components/icon/stnonavailableicon';

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
    <Divider margin="15px" align={['start', 'start']}>
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
