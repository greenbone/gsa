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

import {isDefined} from 'gmp/utils/identity';

import {parseFloat} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import {severityFormat} from 'web/utils/render';

import {
  resultSeverityRiskFactor,
  _NA,
  LOG,
  MEDIUM,
  HIGH,
  translateRiskFactor,
  LOG_VALUE,
} from 'web/utils/severity';

import ProgressBar from './progressbar';

const SeverityBar = ({severity, toolTip}) => {
  let cvss;
  let threat;
  let title;

  if (isDefined(severity)) {
    cvss = parseFloat(severity);
    threat = resultSeverityRiskFactor(cvss);
    title = translateRiskFactor(threat);
  } else {
    title = `${_NA}`;
  }

  const fill = isDefined(cvss) && cvss > 0 ? cvss * 10 : 0;

  let text;
  if (!isDefined(cvss) || cvss < LOG_VALUE) {
    text = title;
  } else {
    text = severityFormat(cvss) + ' (' + title + ')';
  }

  let type;
  if (threat === LOG) {
    type = 'log';
  } else if (threat === MEDIUM) {
    type = 'warn';
  } else if (threat === HIGH) {
    type = 'error';
  } else {
    type = 'low';
  }

  const toolTipText = isDefined(toolTip) ? toolTip : title;

  return (
    <ProgressBar title={toolTipText} progress={fill} background={type}>
      {text}
    </ProgressBar>
  );
};

SeverityBar.propTypes = {
  severity: PropTypes.numberOrNumberString,
  toolTip: PropTypes.string,
};

export default SeverityBar;

// vim: set ts=2 sw=2 tw=80:
