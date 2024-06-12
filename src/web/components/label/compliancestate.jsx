/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

import useTranslation from 'web/hooks/useTranslation';
import {styledExcludeProps} from 'web/utils/styledConfig';
import Theme from 'web/utils/theme';

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
  const [_] = useTranslation();
  return (
  <Label
    {...props}
    backgroundColor={Theme.complianceYes}
    borderColor={Theme.complianceYes}
  >
    {_('Yes')}
  </Label>
  )
};

const NoLabel = props => {
  const [_] = useTranslation();
  return (
  <Label
    {...props}
    backgroundColor={Theme.complianceNo}
    borderColor={Theme.complianceNo}
  >
    {_('No')}
  </Label>
  )
};

const IncompleteLabel = props => {
  const [_] = useTranslation(); 
  return (
  <Label
    {...props}
    backgroundColor={Theme.complianceIncomplete}
    borderColor={Theme.complianceIncomplete}
  >
    {_('Incomplete')}
  </Label>
  )
};

const UndefinedLabel = props => {
  const [_] = useTranslation(); 
  return (
  <Label
    {...props}
    backgroundColor={Theme.complianceUndefined}
    borderColor={Theme.complianceUndefined}
  >
    {_('Undefined')}
  </Label>
  )
};

export const ComplianceStateLabels = {
  Yes: YesLabel,
  No: NoLabel,
  Incomplete: IncompleteLabel,
  Undefined: UndefinedLabel,
};

export default ComplianceStateLabels;

// vim: set ts=2 sw=2 tw=80:
