/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import ProgressBar from './progressbar';
import {getTranslatableReportCompliance} from 'gmp/models/auditreport';

const ComplianceBar = ({compliance, toolTip}) => {
  const title = getTranslatableReportCompliance(compliance);

  let background;
  if (compliance === 'no') {
    background = Theme.complianceNo;
  } else if (compliance === 'incomplete') {
    background = Theme.complianceIncomplete;
  } else if (compliance === 'yes') {
    background = Theme.complianceYes;
  } else {
    background = Theme.complianceUndefined;
  }

  const toolTipText = isDefined(toolTip) ? toolTip : title;

  return (
    <ProgressBar title={toolTipText} progress={100} background={background} data-testid="compliance-bar">
      {title}
    </ProgressBar>
  );
};

ComplianceBar.propTypes = {
  compliance: PropTypes.string,
  toolTip: PropTypes.string,
};

export default ComplianceBar;