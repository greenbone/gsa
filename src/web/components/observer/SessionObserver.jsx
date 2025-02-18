/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Logger from 'gmp/log';
import moment from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import {getSessionTimeout} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';
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
