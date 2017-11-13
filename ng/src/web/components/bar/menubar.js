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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import GBIcon from '../icon/greenboneicon.js';

import Link from '../link/link.js';

import Menu from '../menu/menu.js';
import MenuEntry from '../menu/menuentry.js';

import Sticky from '../sticky/sticky.js';

const GreenboneIcon = glamorous(GBIcon)({
  visibility: 'hidden',
  '.sticky &': {
    visibility: 'visible',
  },
});

const Ul = glamorous.ul({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
});

Ul.displayName = 'StyledUl';

const Wrapper = glamorous(Sticky, {
  displayName: 'StyledSticky',
})(
  'menubar',
  {
    backgroundColor: '#393637',

    '& ul': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },

    '& .menu > a:hover ~ ul > .menu-entry:nth-child(2) > a': {
      background: '#99CE48',
    },

    '& .menu-section': {
      borderTop: '1px solid #b0b0b0',
    },
  },
);

const MenuBar = (props, {gmp, capabilities}) => {
  if (!gmp.isLoggedIn() || !is_defined(capabilities)) {
    return null;
  }

  const may_op_scans = [
    'tasks',
    'reports',
    'results',
    'overrides',
    'notes',
  ].reduce((sum, cur) => sum || capabilities.mayAccess(cur), false);

  const may_op_configuration = [
    'targets',
    'port_lists',
    'credentials',
    'scan_configs',
    'alerts',
    'schedules',
    'report_formats',
    'agents',
    'scanners',
    'filters',
    'tags',
    'permissions',
  ].reduce((sum, cur) => sum || capabilities.mayAccess(cur), false);

  const may_op_admin = [
    'users',
    'roles',
    'groups',
  ].reduce((sum, cur) => sum || capabilities.mayAccess(cur), false) ||
    (capabilities.mayOp('descibe_auth') && capabilities.mayOp('modify_auth'));
  return (
    <Wrapper>
      <Ul>
        <li>
          <Link
            to="/"
            title={_('Dashboard')}>
            <GreenboneIcon size={['35px', '35px']}/>
          </Link>
        </li>
        <Menu
          to="/"
          title={_('Dashboard')}>
        </Menu>
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
              to="overrides"
              caps="get_overrides"
            />
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
          </Menu>
        }
        {capabilities.mayOp('get_info') &&
          <Menu title={_('SecInfo')}>
            <MenuEntry title={_('Dashboard')} to="dashboards/secinfo"/>
            <MenuEntry
              section
              title={_('NVTs')}
              to="nvts"
            />
            <MenuEntry
              title={_('CVEs')}
              to="cves"
            />
            <MenuEntry
              title={_('CPEs')}
              to="cpes"
            />
            <MenuEntry
              title={_('OVAL Definitions')}
              to="ovaldefs"
            />
            <MenuEntry
              title={_('CERT-Bund Advisories')}
              to="certbundadvs"
            />
            <MenuEntry
              title={_('DFN-CERT Advisories')}
              to="dfncertadvs"
            />
            <MenuEntry
              section
              title={_('All SecInfo')}
              to="secinfos"
            />
          </Menu>
        }
        {may_op_configuration &&
          <Menu title={_('Configuration')}>
            <MenuEntry
              title={_('Targets')}
              to="targets"
              caps="get_targets"
            />
            <MenuEntry
              title={_('Port Lists')}
              to="portlists"
              caps="get_port_lists"
            />
            <MenuEntry
              title={_('Credentials')}
              to="credentials"
              caps="get_credentials"
            />
            <MenuEntry
              title={_('Scan Configs')}
              to="scanconfigs"
              caps="get_configs"
            />
            <MenuEntry
              section
              title={_('Alerts')}
              to="alerts"
              caps="get_alerts"
            />
            <MenuEntry
              title={_('Schedules')}
              to="schedules"
              caps="get_schedules"
            />
            <MenuEntry
              title={_('Report Formats')}
              to="reportformats"
              caps="get_report_formats"
            />
            <MenuEntry
              title={_('Agents')}
              to="agents"
              caps="get_agents"
            />
            <MenuEntry
              section
              title={_('Scanners')}
              to="scanners"
              caps="get_scanners"
            />
            <MenuEntry
              title={_('Filters')}
              to="filters"
              caps="get_filters"/>
            <MenuEntry
              title={_('Tags')}
              to="tags"
              caps="get_tags"
            />
            <MenuEntry
              title={_('Permissions')}
              to="permissions"
              caps="get_permissions"
            />
          </Menu>
        }
        <Menu title={_('Extras')}>
          <MenuEntry
            title={_('Trashcan')}
            to="trashcan"
          />
          <MenuEntry
            legacy title={_('My Settings')}
            cmd="get_my_settings"
            caps="get_settings"
          />
          <MenuEntry
            legacy
            title={_('Performance')}
            cmd="get_system_reports"
            slave_id="0"
            caps="get_system_reports"
          />
          <MenuEntry
            title={_('CVSS Calculator')}
            to="cvsscalculator"
          />
          <MenuEntry
            title={_('Feed Status')}
            to="feedstatus"
            caps="get_feeds"
          />
        </Menu>
        {may_op_admin &&
          <Menu title={_('Administration')}>
            <MenuEntry
              title={_('Users')}
              to="users"
              caps="get_users"
            />
            <MenuEntry
              title={_('Groups')}
              to="groups"
              caps="get_groups"
            />
            <MenuEntry
              title={_('Roles')}
              to="roles"
              caps="get_roles"
            />
            <MenuEntry
              section
              title={_('LDAP')}
              to="ldap"
              caps={['describe_auth', 'modify_auth']}
            />
            <MenuEntry
              legacy
              title={_('Radius')}
              cmd="auth_settings"
              name="radius"
              caps={['describe_auth', 'modify_auth']}
            />
          </Menu>
        }
        <Menu
          title={_('Help')}
        >
          <MenuEntry
            legacy
            title={_('Contents')}
            path="help/contents.html"
            caps="help"
          />
          <MenuEntry
            legacy
            title={_('About')}
            path="help/about.html"
          />
        </Menu>
      </Ul>
    </Wrapper>
  );
};

MenuBar.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
  capabilities: PropTypes.capabilities,
};

export default MenuBar;

// vim: set ts=2 sw=2 tw=80:
