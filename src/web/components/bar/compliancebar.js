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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';
import Theme from 'web/utils/theme.js';

import ProgressBar from './progressbar.js';
import {getTranslatableReportCompliance} from 'gmp/models/auditreport';

const ComplianceBar = ({compliance, toolTip}) => {
  const title = getTranslatableReportCompliance(compliance);

  let background;
  if (compliance === 'no') {
    background = Theme.compliance_no;
  } else if (compliance === 'incomplete') {
    background = Theme.compliance_incomplete;
  } else if (compliance === 'yes') {
    background = Theme.compliance_yes;
  } else {
    background = Theme.compliance_undefined;
  }

  const toolTipText = isDefined(toolTip) ? toolTip : title;

  return (
    <ProgressBar title={toolTipText} progress={100} background={background}>
      {title}
    </ProgressBar>
  );
};

ComplianceBar.propTypes = {
  compliance: PropTypes.string,
  toolTip: PropTypes.string,
};

export default ComplianceBar;

// vim: set ts=2 sw=2 tw=80:
