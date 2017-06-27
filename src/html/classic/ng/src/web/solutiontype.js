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

import _ from '../locale.js';

import PropTypes from './proptypes.js';

import Icon from './components/icon/icon.js';

import Layout from './components/layout/layout.js';

const SolutionType = ({
    type,
    displayTitleText = false,
  }) => {
  let img;
  let title;

  switch (type) {
    case 'Workaround':
      title = _('Workaround');
      img = 'st_workaround.svg';
      break;
    case 'Mitigation':
      title = _('Mitigation');
      img = 'st_mitigate.svg';
      break;
    case 'VendorFix':
      title = _('Vendorfix');
      img = 'st_vendorfix.svg';
      break;
    case 'NoneAvailable':
      title = _('None available');
      img = 'st_nonavailable.svg';
      break;
    case 'WillNotFix':
      title = _('Will not fix');
      img = 'st_willnotfix.svg';
      break;
    case '':
      title = '';
      img = 'os_unkown.svg';
      break;
    default:
      return null;
  }

  if (displayTitleText) {
    return (
      <Layout flex align={["start", "center"]}>
        <Icon
          img={img}
          title={title}
          alt={title}/>
        <span>
          {title}
        </span>
      </Layout>
    );
  }

  return (
    <Icon
      img={img}
      title={title}
      alt={title}/>
  );
};

SolutionType.propTypes = {
  type: PropTypes.string,
  displayTitleText: PropTypes.bool,
};


export default SolutionType;

// vim: set ts=2 sw=2 tw=80:
