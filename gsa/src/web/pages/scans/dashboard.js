/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {
  ResultsSeverityDisplay,
} from '../results/dashboard/severityclassdisplay';
import {
  ReportsSeverityDisplay,
} from '../reports/dashboard/severityclassdisplay';
import {TasksStatusDisplay} from '../tasks/dashboard/statusdisplay';
import {
  ReportsHighResultsDisplay,
} from '../reports/dashboard/highresultsdisplay';
import {
  TasksSeverityDisplay,
} from '../tasks/dashboard/severityclassdisplay';

import {TASKS_DISPLAYS} from '../tasks/dashboard';
import {REPORTS_DISPLAYS} from '../reports/dashboard';
import {RESULTS_DISPLAYS} from '../results/dashboard';
import {NOTES_DISPLAYS} from '../notes/dashboard';
import {OVERRIDES_DISPLAYS} from '../overrides/dashboard';
import {VULNS_DISPLAYS} from '../vulns/dashboard/index';

export const SCANS_DASHBOARD_ID = 'c7584d7c-649f-4f8b-9ded-9e1dc20f24c8';

const log = logger.getLogger('web.scans.dashboard');

class ScansDashboard extends React.Component {

  constructor(...args) {
    super(...args);

    this.notifyTask = this.props.notify('tasks.timer');
    this.notifyReports = this.props.notify('reports.timer');
    this.notifyResults = this.props.notify('results.timer');
    this.notifyNotes = this.props.notify('notes.timer');
    this.notifyOverrides = this.props.notify('overrides.timer');
    this.notifyVulns = this.props.notify('vulns.timer');

    this.handleTimer = this.handleTimer.bind(this);
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  getRefreshInterval() {
    const {gmp} = this.props;
    return gmp.autorefresh * 1000;
  }

  startTimer() {
    const refresh = this.getRefreshInterval();
    if (refresh >= 0) {
      this.timer = window.setTimeout(this.handleTimer, refresh);
      log.debug('Started reload timer with id', this.timer, 'and interval of',
        refresh, 'milliseconds');
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

    this.notifyNotes();
    this.notifyOverrides();
    this.notifyReports();
    this.notifyResults();
    this.notifyTask();
    this.notifyVulns();

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
        id={SCANS_DASHBOARD_ID}
        permittedDisplays={[
          ...TASKS_DISPLAYS,
          ...REPORTS_DISPLAYS,
          ...RESULTS_DISPLAYS,
          ...NOTES_DISPLAYS,
          ...OVERRIDES_DISPLAYS,
          ...VULNS_DISPLAYS,
        ]}
        defaultContent={[
          [
            ResultsSeverityDisplay.displayId,
            ReportsSeverityDisplay.displayId,
          ], [
            TasksStatusDisplay.displayId,
            ReportsHighResultsDisplay.displayId,
            TasksSeverityDisplay.displayId,
          ],
        ]}
      />
    );
  }
}

ScansDashboard.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  notify: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
)(ScansDashboard);

// vim: set ts=2 sw=2 tw=80:
