/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';

const DefaultsPart = ({
  alerts,
  credentials,
  openVasScanConfigs,
  ospScanConfigs,
  openVasScanners,
  ospScanners,
  portLists,
  reportFormats,
  schedules,
  targets,
  defaultAlert,
  defaultEsxiCredential,
  defaultOspScanConfig,
  defaultOspScanner,
  defaultOpenvasScanConfig,
  defaultOpenvasScanner,
  defaultPortList,
  defaultReportFormat,
  defaultSmbCredential,
  defaultSnmpCredential,
  defaultSshCredential,
  defaultSchedule,
  defaultTarget,
  capabilities,
  onChange,
}) => {
  return (
    <React.Fragment>
      {capabilities.mayAccess('alert') && (
        <FormGroup title={_('Default Alert')} titleSize="3">
          <Select
            name="defaultAlert"
            value={defaultAlert}
            items={renderSelectItems(alerts, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('credential') && (
        <FormGroup title={_('Default ESXi Credential')} titleSize="3">
          <Select
            name="defaultEsxiCredential"
            value={defaultEsxiCredential}
            items={renderSelectItems(credentials, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('scanconfig') && (
        <FormGroup title={_('Default OSP Scan Config')} titleSize="3">
          <Select
            name="defaultOspScanConfig"
            value={defaultOspScanConfig}
            items={renderSelectItems(ospScanConfigs, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('scanner') && (
        <FormGroup title={_('Default OSP Scanner')} titleSize="3">
          <Select
            name="defaultOspScanner"
            value={defaultOspScanner}
            items={renderSelectItems(ospScanners, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('scanconfig') && (
        <FormGroup title={_('Default OpenVAS Scan Config')} titleSize="3">
          <Select
            name="defaultOpenvasScanConfig"
            value={defaultOpenvasScanConfig}
            items={renderSelectItems(openVasScanConfigs, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('scanner') && (
        <FormGroup title={_('Default OpenVAS Scanner')} titleSize="3">
          <Select
            name="defaultOpenvasScanner"
            value={defaultOpenvasScanner}
            items={renderSelectItems(openVasScanners, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('portlist') && (
        <FormGroup title={_('Default Port List')} titleSize="3">
          <Select
            name="defaultPortList"
            value={defaultPortList}
            items={renderSelectItems(portLists, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('reportformat') && (
        <FormGroup title={_('Default Report Format')} titleSize="3">
          <Select
            name="defaultReportFormat"
            value={defaultReportFormat}
            items={renderSelectItems(reportFormats, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('credential') && (
        <FormGroup title={_('Default SMB Credential')} titleSize="3">
          <Select
            name="defaultSmbCredential"
            value={defaultSmbCredential}
            items={renderSelectItems(credentials, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('credential') && (
        <FormGroup title={_('Default SNMP Credential')} titleSize="3">
          <Select
            name="defaultSnmpCredential"
            value={defaultSnmpCredential}
            items={renderSelectItems(credentials, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('credential') && (
        <FormGroup title={_('Default SSH Credential')} titleSize="3">
          <Select
            name="defaultSshCredential"
            value={defaultSshCredential}
            items={renderSelectItems(credentials, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('schedule') && (
        <FormGroup title={_('Default Schedule')} titleSize="3">
          <Select
            name="defaultSchedule"
            value={defaultSchedule}
            items={renderSelectItems(schedules, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('target') && (
        <FormGroup title={_('Default Target')} titleSize="3">
          <Select
            name="defaultTarget"
            value={defaultTarget}
            items={renderSelectItems(targets, UNSET_VALUE)}
            onChange={onChange}
          />
        </FormGroup>
      )}
    </React.Fragment>
  );
};

DefaultsPart.propTypes = {
  alerts: PropTypes.array,
  capabilities: PropTypes.capabilities.isRequired,
  credentials: PropTypes.array,
  defaultAlert: PropTypes.string,
  defaultEsxiCredential: PropTypes.string,
  defaultOpenvasScanConfig: PropTypes.string,
  defaultOpenvasScanner: PropTypes.string,
  defaultOspScanConfig: PropTypes.string,
  defaultOspScanner: PropTypes.string,
  defaultPortList: PropTypes.string,
  defaultReportFormat: PropTypes.string,
  defaultSchedule: PropTypes.string,
  defaultSmbCredential: PropTypes.string,
  defaultSnmpCredential: PropTypes.string,
  defaultSshCredential: PropTypes.string,
  defaultTarget: PropTypes.string,
  openVasScanConfigs: PropTypes.array,
  openVasScanners: PropTypes.array,
  ospScanConfigs: PropTypes.array,
  ospScanners: PropTypes.array,
  portLists: PropTypes.array,
  reportFormats: PropTypes.array,
  schedules: PropTypes.array,
  targets: PropTypes.array,
  onChange: PropTypes.func,
};

export default withCapabilities(DefaultsPart);

// vim: set ts=2 sw=2 tw=80:
