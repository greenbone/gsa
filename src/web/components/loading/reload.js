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

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

const log = logger.getLogger('web.components.reload');

export const NO_RELOAD = 0;
export const USE_DEFAULT_RELOAD_INTERVAL = -1;
export const USE_DEFAULT_RELOAD_INTERVAL_ACTIVE = -2;
export const USE_DEFAULT_RELOAD_INTERVAL_INACTIVE = -3;
export const LOAD_TIME_FACTOR = 1.2;

class Reload extends React.Component {
  constructor(...args) {
    super(...args);

    this.isVisible = !document.hidden; // the browser window is active and visible to the user

    this.handleTimer = this.handleTimer.bind(this);

    this.reload = this.reload.bind(this);

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  componentWillUnmount() {
    this.isRunning = false;

    this.clearTimer(); // remove possible running timer
    this.removeVisibilityListener();
  }

  componentDidMount() {
    this.isRunning = true;
    const {reload, load: loadFunc = reload, name} = this.props;

    log.debug('Initial loading for', name);

    this.activateVisibilityListener();
    this.internalLoad(loadFunc); // initial loading
  }

  startMeasurement() {
    this.startTimeStamp = performance.now();
  }

  endMeasurement() {
    if (!isDefined(this.startTimeStamp)) {
      return 0;
    }

    const duration = performance.now() - this.startTimeStamp;
    this.startTimeStamp = undefined;
    return duration;
  }

  getReloadInterval() {
    const {
      gmp,
      defaultReloadInterval = gmp.settings.reloadInterval,
      defaultReloadIntervalInactive = gmp.settings.reloadIntervalInactive,
      defaultReloadIntervalActive = gmp.settings.reloadIntervalActive,
      reloadInterval,
    } = this.props;

    let interval;

    if (isDefined(reloadInterval)) {
      interval = reloadInterval();
    }

    if (interval === USE_DEFAULT_RELOAD_INTERVAL_ACTIVE) {
      return this.isVisible
        ? defaultReloadIntervalActive
        : defaultReloadIntervalInactive;
    } else if (interval === USE_DEFAULT_RELOAD_INTERVAL_INACTIVE) {
      return defaultReloadIntervalInactive;
    } else if (
      !isDefined(interval) ||
      interval === USE_DEFAULT_RELOAD_INTERVAL ||
      interval < 0
    ) {
      return this.isVisible
        ? defaultReloadInterval
        : defaultReloadIntervalInactive;
    }

    return interval;
  }

  hasTimer() {
    return isDefined(this.timer);
  }

  startTimer() {
    const {name} = this.props;

    if (!this.isRunning || this.hasTimer()) {
      log.debug('Not starting timer for', name, 'A timer is already running.', {
        isRunning: this.isRunning,
        timer: this.timer,
      });
      return;
    }

    const loadTime = this.endMeasurement();

    log.debug('Loading time for', name, 'was', loadTime, 'milliseconds');

    let interval = this.getReloadInterval();

    if (loadTime > interval && interval > NO_RELOAD) {
      // ensure timer is longer then the loading procedure
      interval = loadTime * LOAD_TIME_FACTOR;
    }

    if (interval > NO_RELOAD) {
      this.timer = setTimeout(this.handleTimer, interval);
      log.debug(
        'Started reload timer with id',
        this.timer,
        'and interval of',
        interval,
        'milliseconds for',
        name,
      );
    } else {
      log.debug('Not starting timer for', name, 'Interval was', interval);
    }
  }

  resetTimer() {
    this.timer = undefined;
  }

  clearTimer() {
    if (this.hasTimer()) {
      log.debug(
        'Clearing reload timer with id',
        this.timer,
        'for',
        this.props.name,
      );

      clearTimeout(this.timer);

      this.resetTimer();
    }
  }

  handleTimer() {
    log.debug(
      'Timer',
      this.timer,
      'for',
      this.props.name,
      'finished. Reloading data.',
    );

    this.resetTimer();

    this.internalLoad();
  }

  activateVisibilityListener() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  removeVisibilityListener() {
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );
  }

  handleVisibilityChange() {
    this.isVisible = !document.hidden;

    if (this.isVisible && this.hasTimer()) {
      // browser tab is visible again
      // restart timer to get a possible shorter interval as the remaining time

      this.clearTimer();
      this.startTimer();
    }
  }

  reload(options) {
    if (!this.isRunning) {
      // don't allow calling reload before initial rendering
      return Promise.resolve();
    }

    log.debug('Reloading for', this.props.name, 'requested.', options);
    return this.internalLoad(this.props.reload, options);
  }

  internalLoad(loadFunc = this.props.reload, options) {
    this.clearTimer();

    if (!isDefined(loadFunc)) {
      return Promise.resolve();
    }

    log.debug('Loading for', this.props.name, 'requested.', options);

    this.startMeasurement();

    return loadFunc(options)
      .then(() => {
        log.debug('Loading for', this.props.name, 'finished.');
        this.startTimer();
      })
      .catch(error => {
        /* don't restart timer to avoid raising several errors */
        log.debug(
          'Loading Promise for',
          this.props.name,
          'has been rejected. Not starting new timer.',
          error,
        );
      });
  }

  render() {
    const {children} = this.props;
    return children({
      reload: this.reload,
    });
  }
}

Reload.propTypes = {
  children: PropTypes.func.isRequired,
  defaultReloadInterval: PropTypes.number,
  defaultReloadIntervalActive: PropTypes.number,
  defaultReloadIntervalInactive: PropTypes.number,
  gmp: PropTypes.gmp.isRequired,
  load: PropTypes.func,
  name: PropTypes.string.isRequired,
  reload: PropTypes.func.isRequired,
  reloadInterval: PropTypes.func,
};

export default withGmp(Reload);
