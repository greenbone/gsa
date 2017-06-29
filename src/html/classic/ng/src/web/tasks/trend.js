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

import PropTypes from '../utils/proptypes.js';

import Icon from '../components/icon/icon.js';

const Trend = ({name}) => {
  let title;
  let img;

  if (name === 'up') {
    title = 'Severity increased';
    img = 'trend_' + name + '.svg';
  }
  else if (name === 'down') {
    title = 'Severity decreased';
    img = 'trend_' + name + '.svg';
  }
  else if (name === 'more') {
    title = 'Vulnerability count increased';
    img = 'trend_' + name + '.svg';
  }
  else if (name === 'less') {
    title = 'Vulnerability count decreased';
    img = 'trend_' + name + '.svg';
  }
  else if (name === 'same') {
    title = 'Vulnerabilities did not change';
    img = 'trend_nochange.svg';
  }
  else {
    return <span/>;
  }

  return (
    <Icon
      img={img}
      size="small"
      alt={title}
      title={title}
    />
  );
};

Trend.propTypes = {
  name: PropTypes.string,
};

export default Trend;

// vim: set ts=2 sw=2 tw=80:
