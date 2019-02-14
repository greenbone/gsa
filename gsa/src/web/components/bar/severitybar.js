/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {parseFloat} from 'gmp/parser';

import PropTypes from '../../utils/proptypes.js';
import {severityFormat} from '../../utils/render.js';

import {
  resultSeverityRiskFactor,
  _NA,
  LOG,
  MEDIUM,
  HIGH,
  translateRiskFactor,
  LOG_VALUE,
} from '../../utils/severity';

import ProgressBar from './progressbar.js';

const SeverityBar = ({severity}) => {
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
  return (
    <ProgressBar title={title} progress={fill} background={type}>
      {text}
    </ProgressBar>
  );
};

SeverityBar.propTypes = {
  severity: PropTypes.numberOrNumberString,
};

export default SeverityBar;

// vim: set ts=2 sw=2 tw=80:
