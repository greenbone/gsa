/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from '../locale.js';

import PropTypes from './proptypes.js';

import Section from './components/section/section.js';

import Dashboard from './dashboard/dashboard.js';
import DashboardControls from './dashboard/controls.js';

import CertBundCharts from './certbund/charts.js';
import CpeCharts from './cpes/charts.js';
import CveCharts from './cves/charts.js';
import DfnCertCharts from './dfncert/charts.js';
import NvtCharts from './nvts/charts.js';
import OvaldefCharts from './ovaldefs/charts.js';
import AllSecinfoCharts from './secinfo/charts.js';

class SecinfoPage extends React.Component {

  constructor(...args) {
    super(...args);

    const {caches} = this.context;

    this.cache = caches.get('secinfodashboard');
  }

  getChildContext() {
    return {cache: this.cache};
  }

  render() {
    return (
      <Section title={_('SecInfo Dashboard')} img="allinfo.svg"
        extra={<DashboardControls/>}>
        <Dashboard
          configPrefId="84ab32da-fe69-44d8-8a8f-70034cf28d4e"
          defaultControllersString={'nvt-by-severity-class|cve-by-created|' +
            'cve-by-severity-class#cert_bund_adv-by-created|' +
            'cert_bund_adv-by-cvss'}
          defaultControllerString="nvt-by-cvss"
          maxComponents="8">
          <NvtCharts/>
          <OvaldefCharts/>
          <CertBundCharts/>
          <CveCharts/>
          <CpeCharts/>
          <DfnCertCharts/>
          <AllSecinfoCharts/>
        </Dashboard>
      </Section>
    );
  }
}

SecinfoPage.contextTypes = {
  caches: PropTypes.cachefactory.isRequired,
};

SecinfoPage.childContextTypes = {
  cache: PropTypes.cache,
};

export default SecinfoPage;

// vim: set ts=2 sw=2 tw=80:
