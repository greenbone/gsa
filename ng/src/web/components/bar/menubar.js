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
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';
import withCapabilities from '../../utils/withCapabilities.js';
import compose from '../../utils/compose.js';

import GBIcon from '../icon/greenboneicon.js';

import Link from '../link/link.js';

import Menu from '../menu/menu.js';
import MenuEntry from '../menu/menuentry.js';
import MenuHelpEntry from '../menu/menuhelpentry.js';
import MenuSection from '../menu/menusection.js';

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
    height: '35px',

    '& ul': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },

    '& .menu > a:hover ~ ul > .menu-entry:nth-child(2) > a': {
      background: '#99CE48',
    },
  },
);

const MenuBar = ({
  gmp,
  capabilities,
}) => {
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
            <MenuSection>
              {capabilities.mayAccess('tasks') &&
                <MenuEntry
                  title={_('Tasks')}
                  to="tasks"
                />
              }
              {capabilities.mayAccess('reports') &&
                <MenuEntry
                  title={_('Reports')}
                  to="reports"
                />
              }
              {capabilities.mayAccess('results') &&
                <MenuEntry
                  title={_('Results')}
                  to="results"
                />
              }
              {capabilities.mayAccess('vulns') &&
                <MenuEntry
                  title={_('Vulnerabilities')}
                  to="vulnerabilities"
                />
              }
            </MenuSection>
            <MenuSection>
              {capabilities.mayAccess('notes') &&
                <MenuEntry
                  section
                  title={_('Notes')}
                  to="notes"
                />
              }
              {capabilities.mayAccess('overrides') &&
                <MenuEntry
                  title={_('Overrides')}
                  to="overrides"
                />
              }
            </MenuSection>
          </Menu>
        }
        {capabilities.mayAccess('assets') &&
          <Menu title={_('Assets')}>
            <MenuEntry title={_('Dashboard')} to="dashboards/assets"/>
            <MenuSection>
              <MenuEntry
                section
                title={_('Hosts')}
                to="hosts"
              />
              <MenuEntry
                title={_('Operating Systems')}
                to="operatingsystems"
              />
            </MenuSection>
          </Menu>
        }
        {capabilities.mayAccess('info') &&
          <Menu title={_('SecInfo')}>
            <MenuEntry title={_('Dashboard')} to="dashboards/secinfo"/>
            <MenuSection>
              <MenuEntry
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
            </MenuSection>
            <MenuSection>
              <MenuEntry
                title={_('All SecInfo')}
                to="secinfos"
              />
            </MenuSection>
          </Menu>
        }
        {may_op_configuration &&
          <Menu title={_('Configuration')}>
            {capabilities.mayAccess('targets') &&
              <MenuEntry
                title={_('Targets')}
                to="targets"
              />
            }
            {capabilities.mayAccess('port_lists') &&
              <MenuEntry
                title={_('Port Lists')}
                to="portlists"
              />
            }
            {capabilities.mayAccess('credentials') &&
              <MenuEntry
                title={_('Credentials')}
                to="credentials"
              />
            }
            {capabilities.mayAccess('configs') &&
              <MenuEntry
                title={_('Scan Configs')}
                to="scanconfigs"
              />
            }
            <MenuSection>
              {capabilities.mayAccess('alerts') &&
                <MenuEntry
                  title={_('Alerts')}
                  to="alerts"
                />
              }
              {capabilities.mayAccess('schedules') &&
                <MenuEntry
                  title={_('Schedules')}
                  to="schedules"
                />
              }
              {capabilities.mayAccess('report_formats') &&
                <MenuEntry
                  title={_('Report Formats')}
                  to="reportformats"
                />
              }
              {capabilities.mayAccess('agents') &&
                <MenuEntry
                  title={_('Agents')}
                  to="agents"
                />
              }
            </MenuSection>
            <MenuSection>
              {capabilities.mayAccess('scanners') &&
                <MenuEntry
                  title={_('Scanners')}
                  to="scanners"
                />
              }
              {capabilities.mayAccess('filters') &&
                <MenuEntry
                  title={_('Filters')}
                  to="filters"
                />
              }
              {capabilities.mayAccess('tags') &&
                <MenuEntry
                  title={_('Tags')}
                  to="tags"
                />
              }
              {capabilities.mayAccess('permissions') &&
                <MenuEntry
                  title={_('Permissions')}
                  to="permissions"
                />
              }
            </MenuSection>
          </Menu>
        }
        <Menu title={_('Extras')}>
          <MenuEntry
            title={_('Trashcan')}
            to="trashcan"
          />
          <MenuEntry
            title={_('My Settings')}
            to="usersettings"
          />
          {capabilities.mayAccess('system_reports') &&
            <MenuEntry
              title={_('Performance')}
              caps="get_system_reports"
              to="performance"
            />
          }
          <MenuEntry
            title={_('CVSS Calculator')}
            to="cvsscalculator"
          />
          {capabilities.mayAccess('feeds') &&
            <MenuEntry
              title={_('Feed Status')}
              to="feedstatus"
              caps="get_feeds"
            />
          }
        </Menu>
        {may_op_admin &&
          <Menu title={_('Administration')}>
            {capabilities.mayAccess('users') &&
              <MenuEntry
                title={_('Users')}
                to="users"
              />
            }
            {capabilities.mayAccess('groups') &&
              <MenuEntry
                title={_('Groups')}
                to="groups"
              />
            }
            {capabilities.mayAccess('roles') &&
              <MenuEntry
                title={_('Roles')}
                to="roles"
              />
            }
            <MenuSection>
              {capabilities.mayOp('describe_auth') &&
                capabilities.mayOp('modify_auth') &&
                <MenuEntry
                  title={_('LDAP')}
                  to="ldap"
                />
              }
              {capabilities.mayOp('describe_auth') &&
                capabilities.mayOp('modify_auth') &&
                <MenuEntry
                  title={_('Radius')}
                  to="radius"
                />
              }
            </MenuSection>
          </Menu>
        }
        <Menu
          title={_('Help')}
        >
          <MenuHelpEntry
            title={_('Contents')}
          />
          <MenuEntry
            title={_('About')}
            to="about"
          />
        </Menu>
      </Ul>
    </Wrapper>
  );
};

MenuBar.propTypes = {
  capabilities: PropTypes.capabilities,
  gmp: PropTypes.gmp.isRequired,
};

export default compose(
  withCapabilities,
  withGmp,
)(MenuBar);

// vim: set ts=2 sw=2 tw=80:
