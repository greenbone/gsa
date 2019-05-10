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
import React from 'react';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

const log = logger.getLogger('web.entity.container');

const defaultReloadIntervalFunc = ({defaultReloadInterval, entity}) =>
  isDefined(entity) ? defaultReloadInterval : 0;

class EntityContainer extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};

    this.reload = this.reload.bind(this);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
  }

  componentDidMount() {
    this.isRunning = true;

    const {id} = this.props;
    this.load(id);
  }

  componentWillUnmount() {
    this.isRunning = false;

    this.clearTimer();
  }

  componentDidUpdate() {
    const {id} = this.props;
    if (id !== this.state.id) {
      this.load(id);
    }
  }

  load(id) {
    this.clearTimer();

    this.setState({id});

    this.props.load(id).then(() => this.startTimer());
  }

  reload() {
    const {id} = this.props;
    this.load(id);
  }

  handleChanged() {
    this.reload();
  }

  getReloadInterval() {
    const {reloadInterval = defaultReloadIntervalFunc} = this.props;

    return reloadInterval(this.props);
  }

  startTimer() {
    if (!this.isRunning || isDefined(this.timer)) {
      log.debug('Not starting timer', {
        isRunning: this.isRunning,
        timer: this.timer,
      });
      return;
    }

    const interval = this.getReloadInterval();

    if (interval > 0) {
      this.timer = global.setTimeout(this.handleTimer, interval);
      log.debug(
        'Started reload timer with id',
        this.timer,
        'and interval of',
        interval,
        'milliseconds',
      );
    }
  }

  resetTimer() {
    this.timer = undefined;
  }

  clearTimer() {
    if (isDefined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
      this.resetTimer();
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.resetTimer();
    this.reload();
  }

  handleError(error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
  }

  render() {
    const {children, onDownload} = this.props;
    return children({
      ...this.props,
      onChanged: this.handleChanged,
      onSuccess: this.handleChanged,
      onError: this.handleError,
      onDownloaded: onDownload,
    });
  }
}

EntityContainer.propTypes = {
  children: PropTypes.func.isRequired,
  defaultReloadInterval: PropTypes.number.isRequired,
  entityType: PropTypes.string.isRequired,
  gmp: PropTypes.gmp.isRequired,
  id: PropTypes.id.isRequired,
  load: PropTypes.func.isRequired,
  reloadInterval: PropTypes.func,
  showError: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default EntityContainer;

// vim: set ts=2 sw=2 tw=80:
