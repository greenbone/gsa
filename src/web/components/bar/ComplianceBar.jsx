/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getTranslatableReportCompliance} from 'gmp/models/auditreport';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import ProgressBar from 'web/components/bar/ProgressBar';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

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
    <ProgressBar
      background={background}
      data-testid="compliance-bar"
      progress={100}
      title={toolTipText}
    >
      {title}
    </ProgressBar>
  );
};

ComplianceBar.propTypes = {
  compliance: PropTypes.string,
  toolTip: PropTypes.string,
};

export default ComplianceBar;
