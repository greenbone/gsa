/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {withRouter} from 'react-router-dom';

import PropTypes from 'web/utils/proptypes';

/**
 * Component to redirect old secinfo urls like
 *
 * /omp?cmd=get_info&info_type=ovaldef&info_id=oval:org.mitre.oval:def:29419_6
 *
 * to the current replacement pages
 */
class LegacyOmpPage extends React.Component {
  componentDidMount() {
    const {location, history} = this.props;
    const {cmd, info_type, info_id = ''} = location.query;

    if (cmd !== 'get_info') {
      history.replace('/notfound');
      return;
    }

    const id = encodeURIComponent(info_id);

    switch (info_type) {
      case 'nvt':
        history.replace('/nvt/' + id);
        break;
      case 'cve':
        history.replace('/cve/' + id);
        break;
      case 'cpe':
        history.replace('/cpe/' + id);
        break;
      case 'ovaldef':
        history.replace('/ovaldef/' + id);
        break;
      case 'cert_bund_adv':
        history.replace('/certbund/' + id);
        break;
      case 'dfn_cert_adv':
        history.replace('/dfncert/' + id);
        break;
      default:
        history.replace('/notfound');
        break;
    }
  }

  render() {
    return null;
  }
}

LegacyOmpPage.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(LegacyOmpPage);
