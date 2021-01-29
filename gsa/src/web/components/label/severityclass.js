/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

const Label = styled.div`
  text-align: center;
  font-weight: normal;
  font-style: normal;
  color: white;
  padding: 1px;
  display: inline-block;
  width: 70px;
  height: 1.5em;
  font-size: 0.8em;
  background-color: ${props => props.backgroundColor};
  border-color: ${props => props.borderColor};
`;

const HighLabel = props => {
  return (
    <Label {...props} backgroundColor="#C83814" borderColor="#C83814">
      {_('High')}
    </Label>
  );
};

const MediumLabel = props => {
  return (
    <Label {...props} backgroundColor="#F0A519" borderColor="#F0A519">
      {_('Medium')}
    </Label>
  );
};

const LowLabel = props => {
  return (
    <Label {...props} backgroundColor="#4F91C7" borderColor="#4F91C7">
      {_('Low')}
    </Label>
  );
};

const LogLabel = props => {
  return (
    <Label {...props} backgroundColor="#191919" borderColor="#191919">
      {_('Log')}
    </Label>
  );
};

const FalsePositiveLabel = props => {
  return (
    <Label {...props} backgroundColor="#191919" borderColor="#191919">
      {_('False Pos.')}
    </Label>
  );
};

export const SeverityClassLabels = {
  High: HighLabel,
  Medium: MediumLabel,
  Low: LowLabel,
  Log: LogLabel,
  FalsePositive: FalsePositiveLabel,
};

export default SeverityClassLabels;

// vim: set ts=2 sw=2 tw=80:
