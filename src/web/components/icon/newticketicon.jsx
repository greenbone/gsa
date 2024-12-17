/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Icon from './svg/new_ticket.svg';
import SvgIcon from './svgicon';


const NewTicketIcon = props => (
  <SvgIcon {...props}>
    <Icon data-testid="new-ticket-icon"/>
  </SvgIcon>
);

export default NewTicketIcon;
