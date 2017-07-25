/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined, is_string} from 'gmp/utils.js';

import OperatingSystems from '../../utils/os.js';

import PropTypes from '../../utils/proptypes.js';

import Divider from '../layout/divider.js';
import Layout from '../layout/layout.js';

import Icon from './icon.js';

const OsIcon = ({
  host,
  osCpe = true,
  osName = false,
  ...props,
}) => {
  const {best_os_txt, best_os_cpe} = host.details;

  let title;
  let os_icon;

  if (is_defined(best_os_txt) && is_string(best_os_txt.value) &&
    best_os_txt.value.includes('[possible conflict]')) {
    os_icon = 'os_conflict.svg';
    if (osCpe) {
      title = _('OS Conflict: {{best_os_txt}} ({{best_os_cpe}})', {
        best_os_txt: best_os_txt.value,
        best_os_cpe: best_os_cpe.value,
      });
    }
    else {
      title = _('OS Conflict: {{best_os_txt}}', {
        best_os_txt: best_os_txt.value,
      });
    }
  }
  else if (is_defined(best_os_cpe)) {
    const os = OperatingSystems.find(best_os_cpe.value);
    if (os) {
      os_icon = os.icon;
      title = os.title;
      if (osCpe && best_os_cpe) {
        title += ' (' + best_os_cpe.value + ')';
      }
    }
  }

  if (!is_defined(os_icon)) {
    os_icon = 'os_unknown.svg';
    if (best_os_txt) {
      title = best_os_txt.value;
    }
    else {
      title = _('No information about the Operation System');
    }
  }

  return (
    <Layout flex>
      <Divider>
        <Icon
          {...props}
          title={title}
          img={os_icon}
        />
        {osName && best_os_txt &&
          <span>{best_os_txt.value}</span>
        }
      </Divider>
    </Layout>
  );
};

OsIcon.propTypes = {
  host: PropTypes.model.isRequired,
  osName: PropTypes.bool,
  osCpe: PropTypes.bool,
};


export default OsIcon;

// vim: set ts=2 sw=2 tw=80:
