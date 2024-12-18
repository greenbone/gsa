/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {connect} from 'react-redux';
import {getUsername} from 'web/store/usersettings/selectors.js';

const withUsername = Component =>
  connect(rootState => ({
    username: getUsername(rootState),
  }))(Component);

export default withUsername;
