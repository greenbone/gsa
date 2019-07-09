/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

const Label = styled.div`
  text-align: center;
  font-weight: normal;
  font-style: normal;
  color: white;
  padding: 1px;
  display: inline-block;
  width: 60px;
  height: 1.5em;
  font-size: 0.8em;
  background-color: ${props => props.backgroundColor};
  border-color: ${props => props.borderColor};
`;

const OpenLabel = props => {
  return (
    <Label {...props} backgroundColor="#C83814" borderColor="#C83814">
      {_('Open')}
    </Label>
  );
};

// same color as "error"

const FixedLabel = props => {
  return (
    <Label {...props} backgroundColor="#99BE48" borderColor="#99BE48">
      {_('Fixed')}
    </Label>
  );
};

// same color as "new"

const FixVerifiedLabel = props => {
  return (
    <Label {...props} backgroundColor="#4F91C7" borderColor="#4F91C7">
      {_('Fix Verified')}
    </Label>
  );
};

// same color as "low"

const ClosedLabel = props => {
  return (
    <Label {...props} backgroundColor="gray" borderColor="gray">
      {_('Closed')}
    </Label>
  );
};

// gray

export const TicketStatusLabels = {
  Open: OpenLabel,
  Fixed: FixedLabel,
  FixVerified: FixVerifiedLabel,
  Closed: ClosedLabel,
};

export default TicketStatusLabels;

// vim: set ts=2 sw=2 tw=80:
