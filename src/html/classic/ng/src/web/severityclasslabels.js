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

import  _ from '../locale.js';

import './css/severityclasslabels.css';

export const LabelHigh = props => {
  return (
    <div className="severity-class-label high">
      {_('High')}
    </div>
  );
};

export const LabelMedium = props => {
  return (
    <div className="severity-class-label medium">
      {_('Medium')}
    </div>
  );
};

export const LabelLow = props => {
  return (
    <div className="severity-class-label low">
      {_('Low')}
    </div>
  );
};

export const LabelLog = props => {
  return (
    <div className="severity-class-label log">
      {_('Log')}
    </div>
  );
};

export const LabelFalsePositive = props => {
  return (
    <div className="severity-class-label false-positive">
      {_('False Pos.')}
    </div>
  );
};

export const SeverityClassLabels = {
  High: LabelHigh,
  Medium: LabelMedium,
  Low: LabelLow,
  Log: LabelLog,
  FalsePositive: LabelFalsePositive,
};

export default SeverityClassLabels;

// vim: set ts=2 sw=2 tw=80:
