/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import ProgressBar from 'web/components/bar/ProgressBar';
import useGmp from 'web/hooks/useGmp';
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
  ResultSeverityRiskFactor,
} from 'web/utils/severity';
import Theme from 'web/utils/Theme';

interface SeverityBarProps {
  severity?: number | string;
  toolTip?: string;
}

const SeverityBar = ({severity, toolTip}: SeverityBarProps) => {
  const gmp = useGmp();
  const severityRating = gmp.settings.severityRating;
  let cvss: number | undefined;
  let threat: ResultSeverityRiskFactor | undefined;
  let title: string;

  if (isDefined(severity)) {
    cvss = parseFloat(severity);
  }

  if (isDefined(cvss)) {
    threat = resultSeverityRiskFactor(cvss, severityRating);
    title = translateRiskFactor(threat);
  } else {
    title = `${_NA}`;
  }

  const fill = isDefined(cvss) && cvss > 0 ? cvss * 10 : 0;

  let text: string;
  if (!isDefined(cvss) || cvss < LOG_VALUE) {
    text = title;
  } else {
    text = severityFormat(cvss) + ' (' + title + ')';
  }

  let background: string;
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

export default SeverityBar;
