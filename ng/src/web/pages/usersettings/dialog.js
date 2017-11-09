/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import {parse_yesno, YES_VALUE, NO_VALUE} from 'gmp/parser.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import Checkbox from '../../components/form/checkbox.js';
import PasswordField from '../../components/form/passwordfield.js';
import Select2 from '../../components/form/select2.js';
import Spinner from '../../components/form/spinner.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import TimeZoneSelect from '../../components/form/timezoneselect.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import {render_options} from '../../utils/render.js';
import withCapabilities from '../../utils/withCapabilities.js';

const Spacer = glamorous.div({marginLeft: '7px'});

const UserSettingsDialog = ({
  visible,
  onClose,
  onSave,
  data,
  optionLists,
  capabilities,
}) => {
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

{/* FIXME Double check new password, before saving possible typos */}
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
              <Select2
                name="userinterfacelanguage"
                value={userinterfacelanguage}
                onChange={onValueChange}>
                {languagesList.map(language => (
                  <option key={language.code} value={language.code}>
                    {language.name} &#124; {language.native_name}
                  </option>
                ))}
              </Select2>
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
              <Select2
                name="severityclass"
                value={severityclass}
                size="30"
                maxLength="400"
                onChange={onValueChange}>
                {render_options(severitiesList)}
              </Select2>
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
                <Select2
                  name="defaultalert"
                  value={defaultalert}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(alertsList)}
                </Select2>
              </FormGroup>
            }

            {capabilities.mayAccess('credentials') &&
              <FormGroup title={_('Default ESXi Credential')} titleSize="3">
                <Select2
                  name="defaultesxicredential"
                  value={defaultesxicredential}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(credentialsList)}
                </Select2>
              </FormGroup>
            }

            {capabilities.mayAccess('configs') &&
              <FormGroup title={_('Default OSP Scan Config')} titleSize="3">
                <Select2
                  name="defaultospscanconfig"
                  value={defaultospscanconfig}
                  size="30"
                  onChange={onValueChange}/>
              </FormGroup>
            }

            {capabilities.mayAccess('scanners') &&
              <FormGroup title={_('Default OSP Scanner')} titleSize="3">
                <Select2
                  name="defaultospscanner"
                  value={defaultospscanner}
                  size="30"
                  onChange={onValueChange}/>
              </FormGroup>
            }

            {capabilities.mayAccess('configs') &&
              <FormGroup title={_('Default OpenVAS Scan Config')} titleSize="3">
                <Select2
                  name="defaultopenvasscanconfig"
                  value={defaultopenvasscanconfig}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(scanconfigsList)}
                </Select2>
              </FormGroup>
            }

            {capabilities.mayAccess('scanners') &&
              <FormGroup title={_('Default OpenVAS Scanner')} titleSize="3">
                <Select2
                  name="defaultopenvasscanner"
                  value={defaultopenvasscanner}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(scannersList)}
                </Select2>
              </FormGroup>
            }

            {capabilities.mayAccess('port_lists') &&
              <FormGroup title={_('Default Port List')} titleSize="3">
                <Select2
                  name="defaultportlist"
                  value={defaultportlist}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(portlistsList)}
                </Select2>
              </FormGroup>
            }

            {capabilities.mayAccess('report_formats') &&
              <FormGroup title={_('Default Report Format')} titleSize="3">
                <Select2
                  name="defaultreportformat"
                  value={defaultreportformat}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(reportformatsList)}
                </Select2>
              </FormGroup>
            }

            {capabilities.mayAccess('credentials') &&
              <div>
                <FormGroup title={_('Default SMB Credential')} titleSize="3">
                  <Select2
                    name="defaultsmbcredential"
                    value={defaultsmbcredential}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(credentialsList)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Default SNMP Credential')} titleSize="3">
                  <Select2
                    name="defaultsnmpcredential"
                    value={defaultsnmpcredential}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(credentialsList)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Default SSH Credential')} titleSize="3">
                  <Select2
                    name="defaultsshcredential"
                    value={defaultsshcredential}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(credentialsList)}
                  </Select2>
                </FormGroup>
              </div>
            }

            {capabilities.mayAccess('schedules') &&
              <FormGroup title={_('Default Schedule')} titleSize="3">
                <Select2
                  name="defaultschedule"
                  value={defaultschedule}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(schedulesList)}
                </Select2>
              </FormGroup>
            }

            {capabilities.mayAccess('targets') &&
              <FormGroup title={_('Default Target')} titleSize="3">
                <Select2
                  name="defaulttarget"
                  value={defaulttarget}
                  size="30"
                  onChange={onValueChange}>
                  {render_options(targetsList)}
                </Select2>
              </FormGroup>
            }

            {capabilities.mayAccess('filters') &&
              <div>
                <h2>{_('Filter Settings')}</h2>


                <FormGroup title={_('Agents Filter')} titleSize="3">
                  <Select2
                    name="agentsfilter"
                    value={agentsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.agent)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Alerts Filter')} titleSize="3">
                  <Select2
                    name="alertsfilter"
                    value={alertsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.alert)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Assets Filter')} titleSize="3">
                  <Select2
                    name="assetsfilter"
                    value={assetsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.asset)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Configs Filter')} titleSize="3">
                  <Select2
                    name="configsfilter"
                    value={configsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.config)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Credentials Filter')} titleSize="3">
                  <Select2
                    name="credentialsfilter"
                    value={credentialsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.credential)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Filters Filter')} titleSize="3">
                  <Select2
                    name="filtersfilter"
                    value={filtersfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.filter)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Notes Filter')} titleSize="3">
                  <Select2
                    name="notesfilter"
                    value={notesfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.note)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Overrides Filter')} titleSize="3">
                  <Select2
                    name="overridesfilter"
                    value={overridesfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.override)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Permissions Filter')} titleSize="3">
                  <Select2
                    name="permissionsfilter"
                    value={permissionsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.permission)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Port List Filter')} titleSize="3">
                  <Select2
                    name="portlistsfilter"
                    value={portlistsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.portlist)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Reports Filter')} titleSize="3">
                  <Select2
                    name="reportsfilter"
                    value={reportsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.report)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Report Formats Filter')} titleSize="3">
                  <Select2
                    name="reportformatsfilter"
                    value={reportformatsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.reportformat)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Results Filter')} titleSize="3">
                  <Select2
                    name="resultsfilter"
                    value={resultsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.result)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Roles Filter')} titleSize="3">
                  <Select2
                    name="rolesfilter"
                    value={rolesfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.role)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Schedules Filter')} titleSize="3">
                  <Select2
                    name="schedulesfilter"
                    value={schedulesfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.schedule)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Tags Filter')} titleSize="3">
                  <Select2
                    name="tagsfilter"
                    value={tagsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.tag)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Targets Filter')} titleSize="3">
                  <Select2
                    name="targetsfilter"
                    value={targetsfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.target)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('Tasks Filter')} titleSize="3">
                  <Select2
                    name="tasksfilter"
                    value={tasksfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.task)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('CPE Filter')} titleSize="3">
                  <Select2
                    name="cpefilter"
                    value={cpefilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('CVE Filter')} titleSize="3">
                  <Select2
                    name="cvefilter"
                    value={cvefilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('NVT Filter')} titleSize="3">
                  <Select2
                    name="nvtfilter"
                    value={nvtfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('OVAL Filter')} titleSize="3">
                  <Select2
                    name="ovalfilter"
                    value={ovalfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('CERT-Bund Filter')} titleSize="3">
                  <Select2
                    name="certbundfilter"
                    value={certbundfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('DFN-CERT Filter')} titleSize="3">
                  <Select2
                    name="dfncertfilter"
                    value={dfncertfilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo)}
                  </Select2>
                </FormGroup>

                <FormGroup title={_('All SecInfo Filter')} titleSize="3">
                  <Select2
                    name="allsecinfofilter"
                    value={allsecinfofilter}
                    size="30"
                    onChange={onValueChange}>
                    {render_options(filtersList.secinfo)}
                  </Select2>
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
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  optionLists: PropTypes.object.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
};


export default withCapabilities(UserSettingsDialog);

// vim: set ts=2 sw=2 tw=80:
