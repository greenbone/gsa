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

import {Sticky} from 'react-sticky';

import _ from '../../locale.js';

import Link from '../link.js';

import Menu from './menu.js';
import MenuEntry from './menuentry.js';

import Icon from '../icons/icon.js';

import './css/menubar.css';

export const MenuBar = (props, context) => {
  let {gmp} = context;

  if (!gmp.isLoggedIn()) {
    return null;
  }
  return (
    <Sticky className="menubar">
      <ul>
        <li className="menu">
          <Link to="/" title={_('Dashboard')}>
            <div className="flex row">
              <Icon img="greenbone.svg" alt={_('Greenbone Security Assistant')}
                className="greenbone-icon none"/>
              <p className="auto">
                {_('Dashboard')}
              </p>
            </div>
          </Link>
        </li>
        <Menu title={_('Scans')} to="dashboards/scans">
          <MenuEntry title={_('Dashboard')} to="dashboards/scans"/>
          <MenuEntry section title={_('Tasks')} to="tasks"/>
          <MenuEntry legacy title={_('Reports')} cmd="get_reports"/>
          <MenuEntry legacy title={_('Results')} to="results"/>
          <MenuEntry legacy title={_('Vulnerabilities')} cmd="get_vulns"/>
          <MenuEntry legacy section title={_('Notes')} cmd="get_notes"
            filter="sort=nvt"/>
          <MenuEntry legacy title={_('Overrides')} cmd="get_overrides"
            filter="sort=nvt"/>
        </Menu>
        <Menu title={_('Assets')} to="dashboards/assets">
          <MenuEntry title={_('Dashboard')} to="dashboards/assets"/>
          <MenuEntry legacy section title={_('Hosts')} cmd="get_assets"
            asset_type="host"/>
          <MenuEntry legacy title={_('Operating Systems')} cmd="get_assets"
            asset_type="os"/>
          <MenuEntry legacy title={_('Hosts (Classic)')} cmd="get_report"
            type="assets" apply_overrides="1" levels="hm"/>
        </Menu>
        <Menu title={_('SecInfo')} to="dashboards/secinfo">
          <MenuEntry title={_('Dashboard')} to="dashboards/secinfo"/>
          <MenuEntry legacy section title={_('NVTs')} cmd="get_info"
            info_type="nvt"/>
          <MenuEntry legacy title={_('CVEs')} cmd="get_info" info_type="cve"/>
          <MenuEntry legacy title={_('CPEs')} cmd="get_info" info_type="cpe"/>
          <MenuEntry legacy title={_('OVAL Definitions')} cmd="get_info"
            info_type="ovaldef"/>
          <MenuEntry legacy title={_('CERT-Bund Advisories')}
            cmd="get_info" info_type="cert_bund_adv"/>
          <MenuEntry legacy title={_('DFN-CERT Advisories')} cmd="get_info"
            info_type="dfn_cert_adv"/>
          <MenuEntry legacy title={_('All SecInfo')} cmd="get_info"
            info_type="allinfo"/>
        </Menu>
        <Menu legacy title={_('Configuration')} cmd="get_targets">
          <MenuEntry legacy title={_('Targets')} cmd="get_targets"/>
          <MenuEntry legacy title={_('Port Lists')} cmd="get_port_lists"/>
          <MenuEntry legacy title={_('Credentials')} cmd="get_credentials"/>
          <MenuEntry legacy title={_('Scan Configs')} cmd="get_configs"/>
          <MenuEntry legacy section title={_('Alerts')} cmd="get_alerts"/>
          <MenuEntry legacy title={_('Schedules')} cmd="get_schedules"/>
          <MenuEntry legacy title={_('Report Formats')}
            cmd="get_report_formats"/>
          <MenuEntry legacy title={_('Agents')} cmd="get_agents"/>
          <MenuEntry legacy section title={_('Scanners')} cmd="get_scanners"/>
          <MenuEntry legacy title={_('Filters')} cmd="get_filters"/>
          <MenuEntry legacy title={_('Tags')} cmd="get_tags"/>
          <MenuEntry legacy title={_('Permissions')} cmd="get_permissions"/>
        </Menu>
        <Menu legacy title={_('Extras')} cmd="get_trash">
          <MenuEntry legacy title={_('Trashcan')} cmd="get_trash"/>
          <MenuEntry legacy title={_('My Settings')} cmd="get_my_settings"/>
          <MenuEntry legacy title={_('Performance')} cmd="get_system_reports"
            slave_id="0"/>
          <MenuEntry legacy title={_('CVSS Calculator')} cmd="cvss_calculator"/>
          <MenuEntry legacy title={_('Feed Status')} cmd="get_feeds"/>
        </Menu>
        <Menu legacy title={_('Administration')} cmd="get_users">
          <MenuEntry legacy title={_('Users')} cmd="get_users"/>
          <MenuEntry legacy title={_('Groups')} cmd="get_groups"/>
          <MenuEntry legacy title={_('Roles')} cmd="get_roles"/>
          <MenuEntry legacy section title={_('LDAP')} cmd="auth_settings"
            name="ldap"/>
          <MenuEntry legacy title={_('Radius')} cmd="auth_settings"
            name="radius"/>
        </Menu>
        <Menu legacy title={_('Help')} path="/help/contents.html">
          <MenuEntry legacy title={_('Contents')}  path="help/contents.html"/>
          <MenuEntry legacy title={_('About')}  path="help/about.html"/>
        </Menu>
      </ul>
    </Sticky>
  );
};

MenuBar.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default MenuBar;
