/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';

import OperatingSystems from '../../utils/os.js';

import PropTypes from '../../utils/proptypes.js';

import Divider from '../layout/divider.js';
import Layout from '../layout/layout.js';

import Icon from './icon.js';

const OsIcon = ({
  displayOsCpe = true,
  displayOsName = false,
  osTxt,
  osCpe,
  ...props,
}) => {
  const os = is_defined(osCpe) ?
    OperatingSystems.find(osCpe) : undefined;

  let title;
  let os_icon;

  if (is_defined(osTxt) && osTxt.includes('[possible conflict]')) {
    os_icon = 'os_conflict.svg';
    if (displayOsCpe) {
      title = _('OS Conflict: {{best_os_txt}} ({{best_os_cpe}})', {
        best_os_txt: osTxt,
        best_os_cpe: osCpe,
      });
    }
    else {
      title = _('OS Conflict: {{best_os_txt}}', {
        best_os_txt: osTxt,
      });
    }
  }
  else if (is_defined(os)) {
    os_icon = os.icon;
    title = os.title;
    if (displayOsCpe) {
      title += ' (' + osCpe + ')';
    }
  }

  if (!is_defined(os_icon)) {
    os_icon = 'os_unknown.svg';
    if (osTxt) {
      title = osTxt;
    }
    else {
      title = _('No information about the Operation System');
    }
  }

  return (
    <Layout flex>
      <Divider title={title}>
        <Icon
          {...props}
          img={os_icon}
        />
        {displayOsName && is_defined(os) &&
          <span>{os.title}</span>
        }
      </Divider>
    </Layout>
  );
};

OsIcon.propTypes = {
  displayOsName: PropTypes.bool,
  displayOsCpe: PropTypes.bool,
  osTxt: PropTypes.string,
  osCpe: PropTypes.string,
};


export default OsIcon;

// vim: set ts=2 sw=2 tw=80:
