/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/string/includes';

import React from 'react';

import PropTypes from '../../utils/proptypes.js';

import ProgressBar from './progressbar.js';

const StatusBar = ({status = 'Unknown', progress = '0'}) => {
  const st = status.toLowerCase();
  let text = status;

  if (st === 'unknown' || st === 'new' || st === 'done' || st === 'container' ||
      st.includes('requested')) {
    progress = '100';
  }

  if (st === 'stopped') {
    text = status + ' at ' + progress + ' %';
  }
  else if (st === 'running') {
    text = progress + ' %';
  }

  let background;
  if (st === 'stopped' || st.includes('requested')) {
    background = 'warn';
  }
  else if (st.includes('error')) {
    background = 'error';
  }
  else if (st === 'uploading' || st === 'container' ||
    st === 'done') {
    background = 'low';
  }
  else if (st === 'new') {
    background = 'new';
  }
  else if (st === 'running') {
    background = 'run';
  }
  return (
    <ProgressBar
      title={status}
      progress={progress}
      background={background}
    >
      {text}
    </ProgressBar>
  );
};

StatusBar.propTypes = {
  progress: PropTypes.numberOrNumberString,
  status: PropTypes.string,
};

export default StatusBar;

// vim: set ts=2 sw=2 tw=80:
