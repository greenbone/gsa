/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import ProgressBar from 'web/components/bar/ProgressBar';
import PropTypes from 'web/utils/PropTypes';
import {severityFormat} from 'web/utils/Render';
import {
  resultSeverityRiskFactor,
  _NA,
  LOG,
  MEDIUM,
  HIGH,
  CRITICAL,
  translateRiskFactor,
  LOG_VALUE,
} from 'web/utils/severity';
import Theme from 'web/utils/Theme';


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

  let background;
  if (threat === LOG) {
    background = Theme.severityClassLog;
  } else if (threat === MEDIUM) {
    background = Theme.severityClassMedium;
  } else if (threat === HIGH) {
    background = Theme.severityClassHigh;
  } else if (threat === CRITICAL) {
    background = Theme.severityClassCritical;
  } else {
    background = Theme.severityClassLow;
  }

  const toolTipText = isDefined(toolTip) ? toolTip : title;

  return (
    <ProgressBar
      background={background}
      data-testid="severitybar"
      progress={fill}
      title={toolTipText}
    >
      {text}
    </ProgressBar>
  );
};

SeverityBar.propTypes = {
  severity: PropTypes.numberOrNumberString,
  toolTip: PropTypes.string,
};

export default SeverityBar;
