/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import logger from 'gmp/log.js';

import {isDefined} from 'gmp/utils/identity';

import Dashboard from 'web/components/dashboard/dashboard';

import PropTypes from 'web/utils/proptypes';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';

import {HOSTS_DISPLAYS} from '../hosts/dashboard';
import {OS_DISPLAYS} from '../operatingsystems/dashboard';
import {HostsVulnScoreDisplay} from '../hosts/dashboard/vulnscoredisplay';
import {HostsTopologyDisplay} from '../hosts/dashboard/topologydisplay';
import {OsVulnScoreDisplay} from '../operatingsystems/dashboard/vulnscoredisplay'; // eslint-disable-line max-len
import {OsSeverityClassDisplay} from '../operatingsystems/dashboard/severityclassdisplay'; // eslint-disable-line max-len
import {HostsModifiedDisplay} from '../hosts/dashboard/modifieddisplay';


export const ASSETS_DASHBOARD_ID = '0320e0db-bf30-4d4f-9379-b0a022d07cf7';

const log = logger.getLogger('web.assets.dashboard');

class AssetsDashboard extends React.Component {

  constructor(...args) {
    super(...args);

    this.notifyHosts = this.props.notify('host.timer');
    this.notifyOs = this.props.notify('os.timer');

    this.handleTimer = this.handleTimer.bind(this);
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  getReloadInterval() {
    const {gmp} = this.props;
    return gmp.reloadInterval;
  }

  startTimer() {
    const interval = this.getReloadInterval();
    if (interval > 0) {
      this.timer = window.setTimeout(this.handleTimer, interval);
      log.debug('Started reload timer with id', this.timer, 'and interval of',
        interval, 'milliseconds');
    }
  }

  clearTimer() {
    if (isDefined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;

    this.notifyHosts();
    this.notifyOs();

    this.startTimer();
  }

  render() {
    const {
      gmp,
      notify,
      ...props
    } = this.props;
    return (
      <Dashboard
        {...props}
        showFilterSelection
        showFilterString
        id={ASSETS_DASHBOARD_ID}
        permittedDisplays={[
          ...HOSTS_DISPLAYS,
          ...OS_DISPLAYS,
        ]}
        defaultContent={[
          [
            HostsVulnScoreDisplay.displayId,
            HostsTopologyDisplay.displayId,
            OsVulnScoreDisplay.displayId,
          ], [
            OsSeverityClassDisplay.displayId,
            HostsModifiedDisplay.displayId,
          ],
        ]}
      />
    );
  }
}

AssetsDashboard.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  notify: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
)(AssetsDashboard);

// vim: set ts=2 sw=2 tw=80:

