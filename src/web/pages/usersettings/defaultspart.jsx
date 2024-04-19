/* Copyright (C) 2018-2022 Greenbone AG
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
  openVasScanners,
  portLists,
  schedules,
  targets,
  defaultAlert,
  defaultEsxiCredential,
  defaultOpenvasScanConfig,
  defaultOpenvasScanner,
  defaultPortList,
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
  defaultPortList: PropTypes.string,
  defaultSchedule: PropTypes.string,
  defaultSmbCredential: PropTypes.string,
  defaultSnmpCredential: PropTypes.string,
  defaultSshCredential: PropTypes.string,
  defaultTarget: PropTypes.string,
  openVasScanConfigs: PropTypes.array,
  openVasScanners: PropTypes.array,
  portLists: PropTypes.array,
  schedules: PropTypes.array,
  targets: PropTypes.array,
  onChange: PropTypes.func,
};

export default withCapabilities(DefaultsPart);

// vim: set ts=2 sw=2 tw=80:
