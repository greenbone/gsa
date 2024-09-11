/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
import useCapabilities from 'web/hooks/useCapabilities';

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
const MenuBar = ({isLoggedIn}) => {
  const caps = useCapabilities();

  if (!isLoggedIn || !isDefined(caps)) {
    return null;
  }

  const may_op_scans = [
    'tasks',
    'reports',
    'results',
    'vulns',
    'overrides',
    'notes',
  ].reduce((sum, cur) => sum || caps.mayAccess(cur), false);

  const may_op_configuration = [
    'targets',
    'port_lists',
    'credentials',
    'scan_configs',
    'alerts',
    'schedules',
    'report_configs',
    'report_formats',
    'scanners',
    'filters',
    'tags',
  ].reduce((sum, cur) => sum || caps.mayAccess(cur), false);

  const mayOpNotesOverrides = ['notes', 'overrides'].reduce(
    (sum, cur) => sum || caps.mayAccess(cur),
    false,
  );

  const mayOpAlertsSchedulesReportFormats = [
    'alerts',
    'schedules',
    'report_formats',
  ].reduce((sum, cur) => sum || caps.mayAccess(cur), false);

  const mayOpScannersFiltersTags = ['scanners', 'filters', 'tags'].reduce(
    (sum, cur) => sum || caps.mayAccess(cur),
    false,
  );

  const mayOpResilience = ['tickets', 'policies', 'audits'].reduce(
    (sum, cur) => sum || caps.mayAccess(cur),
    false,
  );

  const mayOpAssets = ['assets', 'tls_certificates'].reduce(
    (sum, cur) => sum || caps.mayAccess(cur),
    false,
  );

  return (
    <React.Fragment>
      <MenuBarPlaceholder />
      <Wrapper>
        <Ul>
          <Menu to="/dashboard" title={_('Dashboards')} />
          {may_op_scans && (
            <Menu title={_('Scans')}>
              {caps.mayAccess('tasks') && (
                <MenuEntry title={_('Tasks')} to="tasks" />
              )}
              {caps.mayAccess('reports') && (
                <MenuEntry title={_('Reports')} to="reports" />
              )}
              {caps.mayAccess('results') && (
                <MenuEntry title={_('Results')} to="results" />
              )}
              {caps.mayAccess('vulns') && (
                <MenuEntry title={_('Vulnerabilities')} to="vulnerabilities" />
              )}
              {mayOpNotesOverrides && (
                <MenuSection>
                  {caps.mayAccess('notes') && (
                    <MenuEntry title={_('Notes')} to="notes" />
                  )}
                  {caps.mayAccess('overrides') && (
                    <MenuEntry title={_('Overrides')} to="overrides" />
                  )}
                </MenuSection>
              )}
            </Menu>
          )}
          {mayOpAssets && (
            <Menu title={_('Assets')}>
              {caps.mayAccess('assets') && (
                <MenuEntry title={_('Hosts')} to="hosts" />
              )}
              {caps.mayAccess('assets') && (
                <MenuEntry
                  title={_('Operating Systems')}
                  to="operatingsystems"
                />
              )}
              {caps.mayAccess('tls_certificates') && (
                <MenuEntry title={_('TLS Certificates')} to="tlscertificates" />
              )}
            </Menu>
          )}
          {mayOpResilience && (
            <Menu title={_('Resilience')}>
              {caps.mayAccess('tickets') && (
                <MenuEntry title={_('Remediation Tickets')} to="tickets" />
              )}
              <MenuSection>
                {caps.mayAccess('policies') && (
                  <MenuEntry title={_('Compliance Policies')} to="policies" />
                )}
                {caps.mayAccess('audits') && (
                  <MenuEntry title={_('Compliance Audits')} to="audits" />
                )}
                {caps.featureEnabled('COMPLIANCE_REPORTS') &&
                  caps.mayAccess('audits') && (
                    <MenuEntry
                      title={_('Compliance Audit Reports')}
                      to="auditreports"
                    />
                  )}
              </MenuSection>
            </Menu>
          )}
          {caps.mayAccess('info') && (
            <Menu title={_('SecInfo')}>
              <MenuEntry title={_('NVTs')} to="nvts" />
              <MenuEntry title={_('CVEs')} to="cves" />
              <MenuEntry title={_('CPEs')} to="cpes" />
              <MenuEntry title={_('CERT-Bund Advisories')} to="certbunds" />
              <MenuEntry title={_('DFN-CERT Advisories')} to="dfncerts" />
            </Menu>
          )}
          {may_op_configuration && (
            <Menu title={_('Configuration')}>
              {caps.mayAccess('targets') && (
                <MenuEntry title={_('Targets')} to="targets" />
              )}
              {caps.mayAccess('port_lists') && (
                <MenuEntry title={_('Port Lists')} to="portlists" />
              )}
              {caps.mayAccess('credentials') && (
                <MenuEntry title={_('Credentials')} to="credentials" />
              )}
              {caps.mayAccess('configs') && (
                <MenuEntry title={_('Scan Configs')} to="scanconfigs" />
              )}
              {mayOpAlertsSchedulesReportFormats && (
                <MenuSection>
                  {caps.mayAccess('alerts') && (
                    <MenuEntry title={_('Alerts')} to="alerts" />
                  )}
                  {caps.mayAccess('schedules') && (
                    <MenuEntry title={_('Schedules')} to="schedules" />
                  )}
                  {caps.mayAccess('report_configs') && (
                    <MenuEntry title={_('Report Configs')} to="reportconfigs" />
                  )}
                  {caps.mayAccess('report_formats') && (
                    <MenuEntry title={_('Report Formats')} to="reportformats" />
                  )}
                </MenuSection>
              )}
              {mayOpScannersFiltersTags && (
                <MenuSection>
                  {caps.mayAccess('scanners') && (
                    <MenuEntry title={_('Scanners')} to="scanners" />
                  )}
                  {caps.mayAccess('filters') && (
                    <MenuEntry title={_('Filters')} to="filters" />
                  )}
                  {caps.mayAccess('tags') && (
                    <MenuEntry title={_('Tags')} to="tags" />
                  )}
                </MenuSection>
              )}
            </Menu>
          )}
          <Menu title={_('Administration')}>
            {caps.mayAccess('users') && (
              <MenuEntry title={_('Users')} to="users" />
            )}
            {caps.mayAccess('groups') && (
              <MenuEntry title={_('Groups')} to="groups" />
            )}
            {caps.mayAccess('roles') && (
              <MenuEntry title={_('Roles')} to="roles" />
            )}
            {caps.mayAccess('permissions') && (
              <MenuEntry title={_('Permissions')} to="permissions" />
            )}
            <MenuSection>
              {caps.mayAccess('system_reports') && (
                <MenuEntry
                  title={_('Performance')}
                  caps="get_system_reports"
                  to="performance"
                />
              )}
              <MenuEntry title={_('Trashcan')} to="trashcan" />
              {caps.mayAccess('feeds') && (
                <MenuEntry
                  title={_('Feed Status')}
                  to="feedstatus"
                  caps="get_feeds"
                />
              )}
            </MenuSection>
            {caps.mayOp('describe_auth') && (
              <MenuSection>
                {caps.mayOp('modify_auth') && (
                  <MenuEntry title={_('LDAP')} to="ldap" />
                )}
                {caps.mayOp('modify_auth') && (
                  <MenuEntry title={_('RADIUS')} to="radius" />
                )}
              </MenuSection>
            )}
          </Menu>
          <Menu title={_('Help')}>
            <MenuHelpEntry title={_('User Manual')} />
            <MenuEntry title={_('CVSS Calculator')} to="cvsscalculator" />
            <MenuEntry title={_('About')} to="about" />
          </Menu>
        </Ul>
      </Wrapper>
    </React.Fragment>
  );
};

MenuBar.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

const mapStateToProps = rootState => ({
  isLoggedIn: isLoggedIn(rootState),
});

export default compose(connect(mapStateToProps))(MenuBar);

// vim: set ts=2 sw=2 tw=80:
