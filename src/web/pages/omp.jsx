/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
