/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
import React from 'react';

import {connect} from 'react-redux';

import Logger from 'gmp/log';

import moment from 'gmp/models/date';

import {isDefined} from 'gmp/utils/identity';

import {getSessionTimeout} from 'web/store/usersettings/selectors';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

const log = Logger.getLogger('web.observer.sessionobserver');

const DELAY = 15 * 1000; // 15 seconds in milliseconds

class Ping extends React.Component {
  constructor(...args) {
    super(...args);

    this.handlePing = this.handlePing.bind(this);
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer() {
    if (isDefined(this.timer)) {
      log.debug('clearing ping timer', this.timer);

      global.clearTimeout(this.timer);

      this.timer = undefined;
    }
  }

  startTimer() {
    const {sessionTimeout} = this.props;

    const timeout = sessionTimeout.diff(moment()) + DELAY;

    if (timeout > 0) {
      this.timer = global.setTimeout(this.handlePing, timeout);

      log.debug(
        'started ping timer',
        this.timer,
        'timeout',
        timeout,
        'milliseconds',
      );
    }
  }

  handlePing() {
    const {gmp} = this.props;

    this.timer = undefined;

    gmp.user.ping();
  }

  render() {
    return null;
  }
}

Ping.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  sessionTimeout: PropTypes.date.isRequired,
};

Ping = withGmp(Ping);

const SessionObserver = ({sessionTimeout}) => {
  if (!isDefined(sessionTimeout)) {
    return null;
  }

  return <Ping key={sessionTimeout.unix()} sessionTimeout={sessionTimeout} />;
};

SessionObserver.propTypes = {
  sessionTimeout: PropTypes.date,
};

export default connect(rootState => ({
  sessionTimeout: getSessionTimeout(rootState),
}))(SessionObserver);

// vim: set ts=2 sw=2 tw=80:
