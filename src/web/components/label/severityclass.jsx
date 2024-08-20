/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';
import {styledExcludeProps} from 'web/utils/styledConfig';

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
