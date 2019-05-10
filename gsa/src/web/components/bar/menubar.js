/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import {connect} from 'react-redux';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';

import Menu from 'web/components/menu/menu';
import MenuEntry from 'web/components/menu/menuentry';
import MenuHelpEntry from 'web/components/menu/menuhelpentry';
import MenuSection from 'web/components/menu/menusection';

import {isLoggedIn} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';
import withGmp from 'web/utils/withGmp';
import withCapabilities from 'web/utils/withCapabilities';

const MENU_BAR_HEIGHT = '35px';

const Ul = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Wrapper = styled(Layout)`
  background-color: ${Theme.darkGray};
  height: ${MENU_BAR_HEIGHT};
  position: fixed;
  top: 42px;
  left: 0;
  right: 0;
  z-index: ${Theme.Layers.menu};
`;

const MenuBarPlaceholder = styled.div`
  height: ${MENU_BAR_HEIGHT};
`;

// eslint-disable-next-line no-shadow
const MenuBar = ({isLoggedIn, capabilities}) => {
  if (!isLoggedIn || !isDefined(capabilities)) {
    return null;
  }

  const may_op_scans = [
    'tasks',
    'reports',
    'results',
    'overrides',
    'notes',
    'tickets',
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

  const mayOpNotesOverrides = ['notes', 'overrides'].reduce(
    (sum, cur) => sum || capabilities.mayAccess(cur),
    false,
  );

  const mayOpAlertsSchedulesReportFormatsAgents = [
    'alerts',
    'schedules',
    'report_formats',
    'agents',
  ].reduce((sum, cur) => sum || capabilities.mayAccess(cur), false);

  const mayOpScannersFiltersTagsPermissions = [
    'scanners',
    'filters',
    'tags',
    'permissions',
  ].reduce((sum, cur) => sum || capabilities.mayAccess(cur), false);

  const may_op_admin =
    ['users', 'roles', 'groups'].reduce(
      (sum, cur) => sum || capabilities.mayAccess(cur),
      false,
    ) ||
    (capabilities.mayOp('describe_auth') && capabilities.mayOp('modify_auth'));
  return (
    <React.Fragment>
      <MenuBarPlaceholder />
      <Wrapper>
        <Ul>
          <Menu to="/" title={_('Dashboards')} />
          {may_op_scans && (
            <Menu title={_('Scans')}>
              {capabilities.mayAccess('tasks') && (
                <MenuEntry title={_('Tasks')} to="tasks" />
              )}
              {capabilities.mayAccess('reports') && (
                <MenuEntry title={_('Reports')} to="reports" />
              )}
              {capabilities.mayAccess('results') && (
                <MenuEntry title={_('Results')} to="results" />
              )}
              {capabilities.mayAccess('vulns') && (
                <MenuEntry title={_('Vulnerabilities')} to="vulnerabilities" />
              )}
              {capabilities.mayAccess('tickets') && (
                <MenuSection>
                  <MenuEntry title={_('Remediation Tickets')} to="tickets" />
                </MenuSection>
              )}
              {mayOpNotesOverrides && (
                <MenuSection>
                  {capabilities.mayAccess('notes') && (
                    <MenuEntry title={_('Notes')} to="notes" />
                  )}
                  {capabilities.mayAccess('overrides') && (
                    <MenuEntry title={_('Overrides')} to="overrides" />
                  )}
                </MenuSection>
              )}
            </Menu>
          )}
          {capabilities.mayAccess('assets') && (
            <Menu title={_('Assets')}>
              <MenuEntry title={_('Hosts')} to="hosts" />
              <MenuEntry title={_('Operating Systems')} to="operatingsystems" />
            </Menu>
          )}
          {capabilities.mayAccess('info') && (
            <Menu title={_('SecInfo')}>
              <MenuEntry title={_('NVTs')} to="nvts" />
              <MenuEntry title={_('CVEs')} to="cves" />
              <MenuEntry title={_('CPEs')} to="cpes" />
              <MenuEntry title={_('OVAL Definitions')} to="ovaldefs" />
              <MenuEntry title={_('CERT-Bund Advisories')} to="certbunds" />
              <MenuEntry title={_('DFN-CERT Advisories')} to="dfncerts" />
              <MenuSection>
                <MenuEntry title={_('All SecInfo')} to="secinfos" />
              </MenuSection>
            </Menu>
          )}
          {may_op_configuration && (
            <Menu title={_('Configuration')}>
              {capabilities.mayAccess('targets') && (
                <MenuEntry title={_('Targets')} to="targets" />
              )}
              {capabilities.mayAccess('port_lists') && (
                <MenuEntry title={_('Port Lists')} to="portlists" />
              )}
              {capabilities.mayAccess('credentials') && (
                <MenuEntry title={_('Credentials')} to="credentials" />
              )}
              {capabilities.mayAccess('configs') && (
                <MenuEntry title={_('Scan Configs')} to="scanconfigs" />
              )}
              {mayOpAlertsSchedulesReportFormatsAgents && (
                <MenuSection>
                  {capabilities.mayAccess('alerts') && (
                    <MenuEntry title={_('Alerts')} to="alerts" />
                  )}
                  {capabilities.mayAccess('schedules') && (
                    <MenuEntry title={_('Schedules')} to="schedules" />
                  )}
                  {capabilities.mayAccess('report_formats') && (
                    <MenuEntry title={_('Report Formats')} to="reportformats" />
                  )}
                  {capabilities.mayAccess('agents') && (
                    <MenuEntry title={_('Agents')} to="agents" />
                  )}
                </MenuSection>
              )}
              {mayOpScannersFiltersTagsPermissions && (
                <MenuSection>
                  {capabilities.mayAccess('scanners') && (
                    <MenuEntry title={_('Scanners')} to="scanners" />
                  )}
                  {capabilities.mayAccess('filters') && (
                    <MenuEntry title={_('Filters')} to="filters" />
                  )}
                  {capabilities.mayAccess('tags') && (
                    <MenuEntry title={_('Tags')} to="tags" />
                  )}
                  {capabilities.mayAccess('permissions') && (
                    <MenuEntry title={_('Permissions')} to="permissions" />
                  )}
                </MenuSection>
              )}
            </Menu>
          )}
          <Menu title={_('Extras')}>
            <MenuEntry title={_('Trashcan')} to="trashcan" />
            <MenuEntry title={_('My Settings')} to="usersettings" />
            {capabilities.mayAccess('system_reports') && (
              <MenuEntry
                title={_('Performance')}
                caps="get_system_reports"
                to="performance"
              />
            )}
            <MenuEntry title={_('CVSS Calculator')} to="cvsscalculator" />
            {capabilities.mayAccess('feeds') && (
              <MenuEntry
                title={_('Feed Status')}
                to="feedstatus"
                caps="get_feeds"
              />
            )}
          </Menu>
          {may_op_admin && (
            <Menu title={_('Administration')}>
              {capabilities.mayAccess('users') && (
                <MenuEntry title={_('Users')} to="users" />
              )}
              {capabilities.mayAccess('groups') && (
                <MenuEntry title={_('Groups')} to="groups" />
              )}
              {capabilities.mayAccess('roles') && (
                <MenuEntry title={_('Roles')} to="roles" />
              )}
              <MenuSection>
                {capabilities.mayOp('describe_auth') &&
                  capabilities.mayOp('modify_auth') && (
                    <MenuEntry title={_('LDAP')} to="ldap" />
                  )}
                {capabilities.mayOp('describe_auth') &&
                  capabilities.mayOp('modify_auth') && (
                    <MenuEntry title={_('Radius')} to="radius" />
                  )}
              </MenuSection>
            </Menu>
          )}
          <Menu title={_('Help')}>
            <MenuHelpEntry title={_('Contents')} />
            <MenuEntry title={_('About')} to="about" />
          </Menu>
        </Ul>
      </Wrapper>
    </React.Fragment>
  );
};

MenuBar.propTypes = {
  capabilities: PropTypes.capabilities,
  gmp: PropTypes.gmp.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

const mapStateToProps = rootState => ({
  isLoggedIn: isLoggedIn(rootState),
});

export default compose(
  withCapabilities,
  withGmp,
  connect(mapStateToProps),
)(MenuBar);

// vim: set ts=2 sw=2 tw=80:
