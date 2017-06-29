/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from '../../../locale.js';
import {parse_float, is_defined} from '../../../utils.js';

import PropTypes from '../../utils/proptypes.js';
import {result_cvss_risk_factor, cvss_number_format} from '../../utils/render.js';

import './css/statusbar.css';

const SeverityBar = ({severity, scale = 10}) => {
  let cvss = parse_float(severity);
  let threat = result_cvss_risk_factor(cvss);
  let title = _(threat);
  let width = 10 * scale;
  let fill = is_defined(cvss) && cvss > 0 ? cvss * scale : 0;
  let style = {width: fill + 'px'};

  let text;
  if (cvss < 0 || isNaN(cvss)) {
    text = title;
  }
  else {
    text = cvss_number_format(cvss) + ' (' + title + ')';
  }

  let css;
  if (threat === 'Log') {
    css = 'statusbar gray';
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
  severity: PropTypes.numberOrNumberString.isRequired,
  scale: PropTypes.number,
};

export default SeverityBar;

// vim: set ts=2 sw=2 tw=80:
