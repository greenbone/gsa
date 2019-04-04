/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import Divider from 'web/components/layout/divider';

import StNonAvailableIcon from 'web/components/icon/stnonavailableicon';

import PropTypes from 'web/utils/proptypes';

import ErrorContainer from './errorcontainer';

const ErrorMessage = ({message, children}) => (
  <ErrorContainer>
    <Divider>
      <StNonAvailableIcon size="medium" />
      <b>{message}</b>
      {children}
    </Divider>
  </ErrorContainer>
);

ErrorMessage.propTypes = {
  message: PropTypes.string,
};

export default ErrorMessage;
