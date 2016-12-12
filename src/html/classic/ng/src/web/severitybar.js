/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {parse_float, is_defined} from '../utils.js';
import {translate as _} from '../locale.js';

import './css/statusbar.css';

function cvss_risk_factor(score, type) {
  if (type === 'classic') {
    if (score === 0) {
      return 'Log';
    }
    if (score > 0 && score <= 2) {
      return 'Low';
    }
    if (score > 2 && score <= 5) {
      return 'Medium';
    }
    if (score > 5 && score <= 10) {
      return 'High';
    }
    return 'None';
  }
  if (type === 'pci-dss') {
    if (score === 0 && score < 4) {
      return 'Log';
    }
    else if (score >= 4) {
      return 'High';
    }
    return 'None';
  }

  if (score === 0) {
    return 'Log';
  }
  else if (score > 0 && score < 4) {
    return 'Low';
  }
  else if (score >= 4 && score < 7) {
    return 'Medium';
  }
  else if (score >= 7 && score <= 10) {
    return 'High';
  }
  return 'None';
}

function result_cvss_risk_factor(score) {
  if (score > 0) {
    return _(cvss_risk_factor(score));
  }
  if (score === 0) {
    return _('Log');
  }
  if (score === -1) {
    return _('False Positive');
  }
  if (score === -2) {
    return _('Debug');
  }
  if (score === -3) {
    return _('Error');
  }
  return _('N/A');
}

export const SeverityBar = props => {
  let {severity, scale = 10} = props;
  let cvss = parse_float(severity);
  let threat = result_cvss_risk_factor(cvss);
  let title = threat;
  let width = 10 * scale;
  let fill = is_defined(cvss) && cvss > 0 ? cvss * scale : 0;
  let style = {width: fill + 'px'};

  let text;
  if (cvss < 0) {
    text = result_cvss_risk_factor(severity);
  }
  else {
    text = cvss + ' (' + result_cvss_risk_factor(severity) + ')';
  }

  let css;
  if (threat === 'Log') {
    css = 'statusbar gray';
  }
  else if (threat === 'Low') {
    css = 'statusbar done';
  }
  else if (threat === 'Medium') {
    css = 'statusbar request';
  }
  else if (threat === 'High') {
    css = 'statusbar error';
  }
  else {
    css = 'statusbar done';
  }
  return (
    <div className="statusbar statusbar-box" title={title}
      style={{width: width + 'px'}}>
      <div className={css} style={style}/>
      <p>
        {text}
      </p>
    </div>
  );
};

SeverityBar.propTypes = {
  severity: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  scale: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
};

export default SeverityBar;
