/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import SvgIcon from './svgicon';

import Icon from './svg/ticket.svg';

const TicketIcon = props => (
  <SvgIcon {...props}>
    <Icon data-testid="ticket-icon"/>
  </SvgIcon>
);

export default TicketIcon;
