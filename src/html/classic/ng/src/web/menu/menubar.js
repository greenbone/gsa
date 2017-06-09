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

import Sticky from '../sticky/sticky.js';

import _ from '../../locale.js';
import {is_defined} from '../../utils.js';

import Link from '../link.js';
import PropTypes from '../proptypes.js';

import Menu from './menu.js';
import MenuEntry from './menuentry.js';

import Icon from '../icons/icon.js';

import './css/menubar.css';

export const MenuBar = (props, {gmp, capabilities}) => {
  if (!gmp.isLoggedIn() || !is_defined(capabilities)) {
    return null;
  }

  const may_op_tasks = capabilities.mayOp('get_tasks');
  const may_op_reports = capabilities.mayOp('get_reports');
  const may_op_results = capabilities.mayOp('get_results');
  const may_op_overrides = capabilities.mayOp('get_overrides');

  const may_op_scans = may_op_tasks || may_op_reports || may_op_results ||
    may_op_overrides;
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
        {may_op_scans &&
          <Menu title={_('Scans')}>
            <MenuEntry title={_('Dashboard')} to="dashboards/scans"/>
            <MenuEntry
              section
              title={_('Tasks')}
              to="tasks"
              caps="get_tasks"/>
            <MenuEntry
              legacy
              title={_('Reports')}
              to="reports"
              caps="get_reports"/>
            <MenuEntry
              legacy
              title={_('Results')}
              to="results"
              caps="get_results"/>
            <MenuEntry
              title={_('Vulnerabilities')}
              to="vulnerabilities"
              caps="get_vulns"/>
            <MenuEntry
              section
              title={_('Notes')}
              to="notes"
              caps="get_notes"/>
            <MenuEntry
              title={_('Overrides')}
              to="overrides"/>
          </Menu>
        }
        {capabilities.mayOp('get_assets') &&
          <Menu title={_('Assets')}>
            <MenuEntry title={_('Dashboard')} to="dashboards/assets"/>
            <MenuEntry
              section
              title={_('Hosts')}
              to="hosts"/>
            <MenuEntry
              title={_('Operating Systems')}
              to="operatingsystems"/>
            <MenuEntry
              legacy
              title={_('Hosts (Classic)')}
              cmd="get_report"
              type="assets"
              apply_overrides="1"
              levels="hm"
              caps="get_reports"/>
          </Menu>
        }
        {capabilities.mayOp('get_info') &&
          <Menu title={_('SecInfo')}>
            <MenuEntry title={_('Dashboard')} to="dashboards/secinfo"/>
            <MenuEntry
              section
              title={_('NVTs')}
              to="nvts"/>
            <MenuEntry
              title={_('CVEs')}
              to="cves"/>
            <MenuEntry
              title={_('CPEs')}
              to="cpes"/>
            <MenuEntry
              title={_('OVAL Definitions')}
              to="ovaldefs"/>
            <MenuEntry
              title={_('CERT-Bund Advisories')}
              to="certbundadvs"/>
            <MenuEntry
              title={_('DFN-CERT Advisories')}
              to="dfncertadvs"/>
            <MenuEntry
              section
              title={_('All SecInfo')}
              to="secinfos"/>
          </Menu>
        }
        <Menu title={_('Configuration')}>
          <MenuEntry
            title={_('Targets')}
            to="targets"
            caps="get_targets"/>
          <MenuEntry
            title={_('Port Lists')}
            to="portlists"
            caps="get_port_lists"/>
          <MenuEntry
            title={_('Credentials')}
            to="credentials"
            caps="get_credentials"/>
          <MenuEntry
            title={_('Scan Configs')}
            to="scanconfigs"
            caps="get_configs"/>
          <MenuEntry
            section
            title={_('Alerts')}
            to="alerts"
            caps="get_alerts"/>
          <MenuEntry
            title={_('Schedules')}
            to="schedules"
            caps="get_schedules"/>
          <MenuEntry
            title={_('Report Formats')}
            to="reportformats"
            caps="get_report_formats"/>
          <MenuEntry
            title={_('Agents')}
            to="agents"
            caps="get_agents"/>
          <MenuEntry
            section
            title={_('Scanners')}
            to="scanners"
            caps="get_scanners"/>
          <MenuEntry
            title={_('Filters')}
            to="filters"
            caps="get_filters"/>
          <MenuEntry
            title={_('Tags')}
            to="tags"
            caps="get_tags"/>
          <MenuEntry
            title={_('Permissions')}
            to="permissions"
            caps="get_permissions"/>
        </Menu>
        <Menu title={_('Extras')}>
          <MenuEntry
            legacy
            title={_('Trashcan')}
            cmd="get_trash"/>
          <MenuEntry
            legacy title={_('My Settings')}
            cmd="get_my_settings"
            caps="get_settings"/>
          <MenuEntry
            legacy
            title={_('Performance')}
            cmd="get_system_reports"
            slave_id="0"
            caps="get_system_reports"/>
          <MenuEntry
            legacy
            title={_('CVSS Calculator')}
            cmd="cvss_calculator"/>
          <MenuEntry
            legacy
            title={_('Feed Status')}
            cmd="get_feeds"
            caps="get_feeds"/>
        </Menu>
        <Menu title={_('Administration')}>
          <MenuEntry
            title={_('Users')}
            to="users"
            caps="get_users"/>
          <MenuEntry
            title={_('Groups')}
            to="groups"
            caps="get_groups"/>
          <MenuEntry
            title={_('Roles')}
            to="roles"
            caps="get_roles"/>
          <MenuEntry
            legacy
            section
            title={_('LDAP')}
            cmd="auth_settings"
            name="ldap"
            caps={['describe_auth', 'modify_auth']}/>
          <MenuEntry
            legacy
            title={_('Radius')}
            cmd="auth_settings"
            name="radius"
            caps={['describe_auth', 'modify_auth']}/>
        </Menu>
        <Menu
          legacy
          title={_('Help')}
          path="help/contents.html">
          <MenuEntry
            legacy
            title={_('Contents')}
            path="help/contents.html"/>
          <MenuEntry
            legacy
            title={_('About')}
            path="help/about.html"/>
        </Menu>
      </ul>
    </Sticky>
  );
};

MenuBar.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
  capabilities: PropTypes.capabilities,
};

export default MenuBar;

// vim: set ts=2 sw=2 tw=80:
