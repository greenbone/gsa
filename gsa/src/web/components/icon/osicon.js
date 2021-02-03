/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined, isString} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Img from 'web/components/img/img';

import OperatingSystems from 'web/utils/os';
import PropTypes from 'web/utils/proptypes';

const OsIcon = ({
  displayOsCpe = true,
  displayOsName = false,
  osTxt,
  osCpe,
  ...props
}) => {
  const os = isString(osCpe) ? OperatingSystems.find(osCpe) : undefined;

  let title;
  let os_icon;

  if (isString(osTxt) && osTxt.includes('[possible conflict]')) {
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
