/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Icon from 'web/components/icon/svg/ticket.svg';
import SvgIcon from 'web/components/icon/SvgIcon';


const TicketIcon = props => (
  <SvgIcon {...props}>
    <Icon data-testid="ticket-icon"/>
  </SvgIcon>
);

export default TicketIcon;
