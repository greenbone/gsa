/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import {is_defined} from 'gmp/utils/identity';

import Dashboard from 'web/components/dashboard2/dashboard';

import PropTypes from 'web/utils/proptypes';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';

import {CERTBUND_DISPLAYS} from '../certbund/dashboard';
import {CPES_DISPLAYS} from '../cpes/dashboard';
import {CVES_DISPLAYS} from '../cves/dashboard';
import {DFNCERT_DISPLAYS} from '../dfncert/dashboard';
import {NVTS_DISPLAYS} from '../nvts/dashboard';
import {OVALDEF_DISPLAYS} from '../ovaldefs/dashboard';
import {SECINFO_DISPLAYS} from '../secinfo/dashboard';
import {NvtsSeverityClassDisplay} from '../nvts/dashboard/severityclassdisplay';
import {CvesCreatedDisplay} from '../cves/dashboard/createddisplay';
import {CvesSeverityClassDisplay} from '../cves/dashboard/severityclassdisplay';
import {CertBundCreatedDisplay} from '../certbund/dashboard/createddisplay';
import {CertBundCvssDisplay} from '../certbund/dashboard/cvssdisplay'; // eslint-disable-line max-len

export const SECURITYINFO_DASHBOARD_ID = '84ab32da-fe69-44d8-8a8f-70034cf28d4e';

const log = logger.getLogger('web.securityinfo.dashboard');

class SecurityInfoDashboard extends React.Component {

  constructor(...args) {
    super(...args);

    this.notifyCpes = this.props.notify('cpe.timer');

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
    if (is_defined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;

    this.notifyCpes();
  }

  render() {
    return (
      <Dashboard
        showFilterSelection
        showFilterString
        id={SECURITYINFO_DASHBOARD_ID}
        permittedDisplays={[
          ...CERTBUND_DISPLAYS,
          ...CPES_DISPLAYS,
          ...CVES_DISPLAYS,
          ...DFNCERT_DISPLAYS,
          ...NVTS_DISPLAYS,
          ...OVALDEF_DISPLAYS,
          ...SECINFO_DISPLAYS,
        ]}
        defaultContent={[
          [
            NvtsSeverityClassDisplay.displayId,
            CvesCreatedDisplay.displayId,
            CvesSeverityClassDisplay.displayId,
          ], [
            CertBundCreatedDisplay.displayId,
            CertBundCvssDisplay.displayId,
          ],
        ]}
      />
    );
  }
}

SecurityInfoDashboard.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  notify: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
)(SecurityInfoDashboard);

// vim: set ts=2 sw=2 tw=80:
