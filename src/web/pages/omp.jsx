/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {withRouter} from 'web/utils/withRouter';

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
    const {location, navigate} = this.props;
    const {cmd, info_type, info_id = ''} = location.query;

    if (cmd !== 'get_info') {
      navigate('/notfound', {replace: true});
      return;
    }

    const id = encodeURIComponent(info_id);

    switch (info_type) {
      case 'nvt':
        navigate('/nvt/' + id, {replace: true});
        break;
      case 'cve':
        navigate('/cve/' + id, {replace: true});
        break;
      case 'cpe':
        navigate('/cpe/' + id, {replace: true});
        break;
      case 'cert_bund_adv':
        navigate('/certbund/' + id, {replace: true});
        break;
      case 'dfn_cert_adv':
        navigate('/dfncert/' + id, {replace: true});
        break;
      default:
        navigate('/notfound', {replace: true});
        break;
    }
  }

  render() {
    return null;
  }
}

LegacyOmpPage.propTypes = {
  navigate: PropTypes.object.isRequired,
};

export default withRouter(LegacyOmpPage);
