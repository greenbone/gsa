/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import 'core-js/fn/string/includes';

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import OperatingSystems from 'web/utils/os';

import PropTypes from 'web/utils/proptypes';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Img from 'web/components/img/img';

const OsIcon = ({
  displayOsCpe = true,
  displayOsName = false,
  osTxt,
  osCpe,
  ...props
}) => {
  const os = isDefined(osCpe) ? OperatingSystems.find(osCpe) : undefined;

  let title;
  let os_icon;

  if (isDefined(osTxt) && osTxt.includes('[possible conflict]')) {
    os_icon = 'os_conflict.svg';
    if (displayOsCpe) {
      title = _('OS Conflict: {{best_os_txt}} ({{best_os_cpe}})', {
        best_os_txt: osTxt,
        best_os_cpe: osCpe,
      });
    } else {
      title = _('OS Conflict: {{best_os_txt}}', {
        best_os_txt: osTxt,
      });
    }
  } else if (isDefined(os)) {
    os_icon = os.icon;
    title = os.title;
    if (displayOsCpe) {
      title += ' (' + osCpe + ')';
    }
  }

  if (!isDefined(os_icon)) {
    os_icon = 'os_unknown.svg';
    if (osTxt) {
      title = osTxt;
    } else {
      title = _('No information about the Operation System');
    }
  }

  return (
    <Layout>
      <Divider title={title}>
        <Img {...props} width="16px" src={os_icon} />
        {displayOsName && isDefined(os) && <span>{os.title}</span>}
      </Divider>
    </Layout>
  );
};

OsIcon.propTypes = {
  displayOsCpe: PropTypes.bool,
  displayOsName: PropTypes.bool,
  osCpe: PropTypes.string,
  osTxt: PropTypes.string,
};

export default OsIcon;

// vim: set ts=2 sw=2 tw=80:
