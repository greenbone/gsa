/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
} from '../../utils/severity';

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
