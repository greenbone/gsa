/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {is_defined} from 'gmp/utils/identity';
import {parse_yesno, YES_VALUE, NO_VALUE} from 'gmp/parser.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import Checkbox from '../../components/form/checkbox.js';
import PasswordField from '../../components/form/passwordfield.js';
import Select from '../../components/form/select.js';
import Spinner from '../../components/form/spinner.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import TimeZoneSelect from '../../components/form/timezoneselect.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import {render_options} from '../../utils/render.js';
import withCapabilities from '../../utils/withCapabilities.js';
import PropTypes from '../../utils/proptypes.js';

const Spacer = glamorous.div({marginLeft: '7px'});

const UserSettingsDialog = ({
  visible,
  onClose,
  onSave,
  data,
  optionLists,
  capabilities,
}) => {
  const {
    alertsList,
    credentialsList,
    filtersList,
    languagesList,
    portlistsList,
    reportformatsList,
    scanconfigsList,
    scannersList,
    schedulesList,
    severitiesList,
    targetsList,
  } = optionLists;

  const languageItems = languagesList.map(([code, name, native_name]) => ({
    value: code,
    label: is_defined(native_name) ? `${name} | ${native_name}` : name,
  }));

  return (
    <SaveDialog
      visible={visible}
      title={_('Edit User Settings')}
      onClose={onClose}
      onSave={onSave}
      initialData={data}
    >
      {({
        data: state,
        onValueChange,
      }) => {
        const {
          timezone,
          oldpassword,
          newpassword,
          userinterfacelanguage,
          defaultseverity,
          rowsperpage,
          detailsexportfilename,
          listexportfilename,
          reportexportfilename,
          severityclass,
          dynamicseverity,
          defaultalert,
          defaultesxicredential,
          defaultospscanconfig,
          defaultospscanner,
          defaultopenvasscanconfig,
          defaultopenvasscanner,
          defaultportlist,
          defaultreportformat,
          defaultsmbcredential,
          defaultsnmpcredential,
          defaultsshcredential,
          defaultschedule,
          defaulttarget,
          agentsfilter,
          alertsfilter,
          assetsfilter,
          configsfilter,
          credentialsfilter,
          filtersfilter,
          notesfilter,
          overridesfilter,
          permissionsfilter,
          portlistsfilter,
          reportsfilter,
          reportformatsfilter,
          resultsfilter,
          rolesfilter,
          schedulesfilter,
          tagsfilter,
          targetsfilter,
          tasksfilter,
          cpefilter,
          cvefilter,
          nvtfilter,
          ovalfilter,
          certbundfilter,
          dfncertfilter,
          allsecinfofilter,
          autocacherebuild,
        } = state;
        return (
          <Layout flex="column">
            <h2>{_('General Settings')}</h2>
            <FormGroup title={_('Timezone')} titleSize="3">
              <TimeZoneSelect
                name="timezone"
                value={timezone}
                size="40"
                onChange={onValueChange}
                maxLength="80"/>
              <Spacer>
                <small>{_('Will be updated after the next login')}</small>
              </Spacer>
            </FormGroup>

            {/* FIXME Double check new password,
               before saving possible typos */}
            <FormGroup title={_('Password')} titleSize="3">
              <Divider
                flex="column"
                margin="2px"
              >
                <FormGroup title={_('Old')}>
                  <PasswordField
                    name="oldpassword"
                    value={oldpassword}
                    grow="1"
                    size="30"
                    maxLength="400"
                    autoComplete="off"
                    onChange={onValueChange}/>
                </FormGroup>
                <FormGroup title={_('New')}>
                  <PasswordField
                    name="newpassword"
                    value={newpassword}
                    grow="1"
                    size="30"
                    maxLength="400"
                    autoComplete="off"
                    onChange={onValueChange}/>
                </FormGroup>
              </Divider>
            </FormGroup>

            <FormGroup title={_('User Interface Language')} titleSize="3">
              <Select
                name="userinterfacelanguage"
                value={userinterfacelanguage}
                items={languageItems}
                onChange={onValueChange}>
              </Select>
            </FormGroup>

            <FormGroup title={_('Rows Per Page')} titleSize="3">
              <TextField
                name="rowsperpage"
                value={rowsperpage}
                size="30"
                maxLength="800"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Details Export File Name')} titleSize="3">
              <TextField
                name="detailsexportfilename"
                value={detailsexportfilename}
                size="30"
                maxLength="800"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('List Export File Name')} titleSize="3">
              <TextField
                name="listexportfilename"
                value={listexportfilename}
                size="30"
                maxLength="800"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Report Export File Name')} titleSize="3">
              <TextField
                name="reportexportfilename"
                value={reportexportfilename}
                size="30"
                maxLength="800"
                onChange={onValueChange}/>
            </FormGroup>

            <h2>{_('Severity Settings')}</h2>

            <FormGroup title={_('Severity Class')} titleSize="3">
              <Select
                name="severityclass"
                value={severityclass}
                size="30"
                maxLength="400"
                onChange={onValueChange}>
                {render_options(severitiesList, '')}
              </Select>
            </FormGroup>

            <FormGroup title={_('Dynamic Severity')} titleSize="3">
              <Checkbox
                name="dynamicseverity"
                checked={parse_yesno(dynamicseverity) === YES_VALUE}
                checkedValue={YES_VALUE}
                unCheckedValue={NO_VALUE}
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Default Severity')} titleSize="3">
              <Spinner
                name="defaultseverity"
                value={defaultseverity}
                min="0"
                max="10"
                step="0.1"
                type="float"
                onChange={onValueChange}/>
            </FormGroup>

            <h2>{_('Defaults Settings')}</h2>

            {capabilities.mayAccess('alerts') &&
              <FormGroup title={_('Default Alert')} titleSize="3">
                <Select
                  name="defaultalert"
                  value={defaultalert}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(alertsList, '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('credentials') &&
              <FormGroup title={_('Default ESXi Credential')} titleSize="3">
                <Select
                  name="defaultesxicredential"
                  value={defaultesxicredential}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(credentialsList, '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('configs') &&
              <FormGroup title={_('Default OSP Scan Config')} titleSize="3">
                <Select
                  name="defaultospscanconfig"
                  value={defaultospscanconfig}
                  size="30"
                  onChange={onValueChange}>
                  {/* FIXME insert options */}
                  {render_options([], '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('scanners') &&
              <FormGroup title={_('Default OSP Scanner')} titleSize="3">
                <Select
                  name="defaultospscanner"
                  value={defaultospscanner}
                  size="30"
                  onChange={onValueChange}>
                  {/* FIXME insert options */}
                  {render_options([], '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('configs') &&
              <FormGroup title={_('Default OpenVAS Scan Config')} titleSize="3">
                <Select
                  name="defaultopenvasscanconfig"
                  value={defaultopenvasscanconfig}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(scanconfigsList, '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('scanners') &&
              <FormGroup title={_('Default OpenVAS Scanner')} titleSize="3">
                <Select
                  name="defaultopenvasscanner"
                  value={defaultopenvasscanner}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(scannersList, '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('port_lists') &&
              <FormGroup title={_('Default Port List')} titleSize="3">
                <Select
                  name="defaultportlist"
                  value={defaultportlist}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(portlistsList, '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('report_formats') &&
              <FormGroup title={_('Default Report Format')} titleSize="3">
                <Select
                  name="defaultreportformat"
                  value={defaultreportformat}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(reportformatsList, '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('credentials') &&
              <div>
                <FormGroup title={_('Default SMB Credential')} titleSize="3">
                  <Select
                    name="defaultsmbcredential"
                    value={defaultsmbcredential}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(credentialsList, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Default SNMP Credential')} titleSize="3">
                  <Select
                    name="defaultsnmpcredential"
                    value={defaultsnmpcredential}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(credentialsList, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Default SSH Credential')} titleSize="3">
                  <Select
                    name="defaultsshcredential"
                    value={defaultsshcredential}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(credentialsList, '')}
                  </Select>
                </FormGroup>
              </div>
            }

            {capabilities.mayAccess('schedules') &&
              <FormGroup title={_('Default Schedule')} titleSize="3">
                <Select
                  name="defaultschedule"
                  value={defaultschedule}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(schedulesList, '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('targets') &&
              <FormGroup title={_('Default Target')} titleSize="3">
                <Select
                  name="defaulttarget"
                  value={defaulttarget}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(targetsList, '')}
                </Select>
              </FormGroup>
            }

            {capabilities.mayAccess('filters') &&
              <div>
                <h2>{_('Filter Settings')}</h2>


                <FormGroup title={_('Agents Filter')} titleSize="3">
                  <Select
                    name="agentsfilter"
                    value={agentsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.agent, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Alerts Filter')} titleSize="3">
                  <Select
                    name="alertsfilter"
                    value={alertsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.alert, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Assets Filter')} titleSize="3">
                  <Select
                    name="assetsfilter"
                    value={assetsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.asset, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Configs Filter')} titleSize="3">
                  <Select
                    name="configsfilter"
                    value={configsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.config, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Credentials Filter')} titleSize="3">
                  <Select
                    name="credentialsfilter"
                    value={credentialsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.credential, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Filters Filter')} titleSize="3">
                  <Select
                    name="filtersfilter"
                    value={filtersfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.filter, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Notes Filter')} titleSize="3">
                  <Select
                    name="notesfilter"
                    value={notesfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.note, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Overrides Filter')} titleSize="3">
                  <Select
                    name="overridesfilter"
                    value={overridesfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.override, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Permissions Filter')} titleSize="3">
                  <Select
                    name="permissionsfilter"
                    value={permissionsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.permission, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Port List Filter')} titleSize="3">
                  <Select
                    name="portlistsfilter"
                    value={portlistsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.portlist, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Reports Filter')} titleSize="3">
                  <Select
                    name="reportsfilter"
                    value={reportsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.report, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Report Formats Filter')} titleSize="3">
                  <Select
                    name="reportformatsfilter"
                    value={reportformatsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.reportformat, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Results Filter')} titleSize="3">
                  <Select
                    name="resultsfilter"
                    value={resultsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.result, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Roles Filter')} titleSize="3">
                  <Select
                    name="rolesfilter"
                    value={rolesfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.role, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Schedules Filter')} titleSize="3">
                  <Select
                    name="schedulesfilter"
                    value={schedulesfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.schedule, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Tags Filter')} titleSize="3">
                  <Select
                    name="tagsfilter"
                    value={tagsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.tag, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Targets Filter')} titleSize="3">
                  <Select
                    name="targetsfilter"
                    value={targetsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.target, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('Tasks Filter')} titleSize="3">
                  <Select
                    name="tasksfilter"
                    value={tasksfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.task, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('CPE Filter')} titleSize="3">
                  <Select
                    name="cpefilter"
                    value={cpefilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('CVE Filter')} titleSize="3">
                  <Select
                    name="cvefilter"
                    value={cvefilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('NVT Filter')} titleSize="3">
                  <Select
                    name="nvtfilter"
                    value={nvtfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('OVAL Filter')} titleSize="3">
                  <Select
                    name="ovalfilter"
                    value={ovalfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('CERT-Bund Filter')} titleSize="3">
                  <Select
                    name="certbundfilter"
                    value={certbundfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('DFN-CERT Filter')} titleSize="3">
                  <Select
                    name="dfncertfilter"
                    value={dfncertfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo, '')}
                  </Select>
                </FormGroup>

                <FormGroup title={_('All SecInfo Filter')} titleSize="3">
                  <Select
                    name="allsecinfofilter"
                    value={allsecinfofilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo, '')}
                  </Select>
                </FormGroup>
              </div>
            }

            <h2>{_('Miscellaneous Settings')}</h2>

            <FormGroup title={_('Auto Cache Rebuild')} titleSize="3">
              <Checkbox
                name="autocacherebuild"
                checked={parse_yesno(autocacherebuild) === YES_VALUE}
                checkedValue={YES_VALUE}
                unCheckedValue={NO_VALUE}
                onChange={onValueChange}/>
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

UserSettingsDialog.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  data: PropTypes.object.isRequired,
  optionLists: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};


export default withCapabilities(UserSettingsDialog);

// vim: set ts=2 sw=2 tw=80:
