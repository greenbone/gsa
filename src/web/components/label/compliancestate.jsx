/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import PropTypes from 'web/utils/proptypes';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

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
  background-color: ${props => props.$backgroundColor};
  border-color: ${props => props.$borderColor};
`;

const ComplianceLabel = ({text, color, ...props}) => {
  const [_] = useTranslation();
  return (
  <Label
    {...props}
    $backgroundColor={Theme[color]}
    $borderColor={Theme[color]}
  >
    {_(text)}
  </Label>
  )
};

ComplianceLabel.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
};

const YesLabel = props => <ComplianceLabel {...props} text="Yes" color="complianceYes" />;
const NoLabel = props => <ComplianceLabel {...props} text='No' color='complianceNo' />;
const IncompleteLabel = props => <ComplianceLabel {...props} text='Incomplete' color='complianceIncomplete' />;
const UndefinedLabel = props => <ComplianceLabel {...props} text='Undefined' color='complianceUndefined' />;

export const ComplianceStateLabels = {
  Yes: YesLabel,
  No: NoLabel,
  Incomplete: IncompleteLabel,
  Undefined: UndefinedLabel,
};

export default ComplianceStateLabels;