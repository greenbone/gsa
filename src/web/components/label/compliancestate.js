/* Copyright (C) 2024 Greenbone AG
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
import {styledExcludeProps} from 'web/utils/styledConfig';
import Theme from 'web/utils/theme.js';

const Label = styledExcludeProps(styled.div, [
  'backgroundColor',
  'borderColor',
])`
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

const YesLabel = props => {
  return (
    <Label
      {...props}
      backgroundColor={Theme.compliance_yes}
      borderColor={Theme.compliance_yes}
    >
      {_('Yes')}
    </Label>
  );
};

const NoLabel = props => {
  return (
    <Label
      {...props}
      backgroundColor={Theme.compliance_no}
      borderColor={Theme.compliance_no}
    >
      {_('No')}
    </Label>
  );
};

const IncompleteLabel = props => {
  return (
    <Label
      {...props}
      backgroundColor={Theme.compliance_incomplete}
      borderColor={Theme.compliance_incomplete}
    >
      {_('Incomplete')}
    </Label>
  );
};

const UndefinedLabel = props => {
  return (
    <Label
      {...props}
      backgroundColor={Theme.compliance_undefined}
      borderColor={Theme.compliance_undefined}
    >
      {_('Undefined')}
    </Label>
  );
};

export const ComplianceStateLabels = {
  Yes: YesLabel,
  No: NoLabel,
  Incomplete: IncompleteLabel,
  Undefined: UndefinedLabel,
};

export default ComplianceStateLabels;

// vim: set ts=2 sw=2 tw=80:
