/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Icon from './svg/ticket.svg';
import SvgIcon from './SvgIcon';


const TicketIcon = props => (
  <SvgIcon {...props}>
    <Icon data-testid="ticket-icon"/>
  </SvgIcon>
);

export default TicketIcon;
