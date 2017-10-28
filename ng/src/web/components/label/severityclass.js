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

import glamorous from 'glamorous';

import  _ from 'gmp/locale.js';

const Label = glamorous.div(
  'severity-class-label',
  {
    textAlign: 'center',
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: 'white',
    padding: 0,
    borderWidth: '1px',
    borderStyle: 'outset',
    display: 'inline-block',
    width: '60px',
    height: '1.5em',
    fontSize: '0.8em',
  },
);

const HighLabel = glamorous(props => (
  <Label {...props}>
    {_('High')}
  </Label>
))(
  'high',
  {
    backgroundColor: '#C83814',
    borderColor: '#C83814',
  }
);

const MediumLabel = glamorous(props => (
  <Label {...props}>
    {_('Medium')}
  </Label>
))(
  'medium',
  {
    backgroundColor: '#F0A519',
    borderColor: '#F0A519',
  },
);

const LowLabel = glamorous(props => (
  <Label {...props}>
    {_('Low')}
  </Label>
))(
  'low',
  {
    backgroundColor: '#4F91C7',
    borderColor: '#4F91C7',
  },
);

const LogLabel = glamorous(props => (
  <Label {...props}>
    {_('Log')}
  </Label>
))(
  'log',
  {
    backgroundColor: '#191919',
    borderColor: '#191919',
  },
);

const FalsePositiveLabel = glamorous(props => (
  <Label {...props}>
    {_('False Pos.')}
  </Label>
))(
  'false-positive',
  {
    backgroundColor: '#191919',
    borderColor: '#191919',
  },
);

export const SeverityClassLabels = {
  High: HighLabel,
  Medium: MediumLabel,
  Low: LowLabel,
  Log: LogLabel,
  FalsePositive: FalsePositiveLabel,
};

export default SeverityClassLabels;

// vim: set ts=2 sw=2 tw=80:
