/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {
  renderSelectItems,
  UNSET_VALUE,
  UNSET_VALUE_EMPTY_STRING,
} from 'web/utils/Render';

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
  onChange,
}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <React.Fragment>
      {capabilities.mayAccess('alert') && (
        <FormGroup title={_('Default Alert')} titleSize="3">
          <Select
            items={renderSelectItems(alerts, UNSET_VALUE_EMPTY_STRING)}
            name="defaultAlert"
            value={defaultAlert}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('credential') && (
        <FormGroup title={_('Default ESXi Credential')} titleSize="3">
          <Select
            items={renderSelectItems(credentials, UNSET_VALUE)}
            name="defaultEsxiCredential"
            value={defaultEsxiCredential}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('scanconfig') && (
        <FormGroup title={_('Default OpenVAS Scan Config')} titleSize="3">
          <Select
            items={renderSelectItems(openVasScanConfigs, UNSET_VALUE)}
            name="defaultOpenvasScanConfig"
            value={defaultOpenvasScanConfig}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('scanner') && (
        <FormGroup title={_('Default OpenVAS Scanner')} titleSize="3">
          <Select
            items={renderSelectItems(openVasScanners, UNSET_VALUE)}
            name="defaultOpenvasScanner"
            value={defaultOpenvasScanner}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('portlist') && (
        <FormGroup title={_('Default Port List')} titleSize="3">
          <Select
            items={renderSelectItems(portLists, UNSET_VALUE)}
            name="defaultPortList"
            value={defaultPortList}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('credential') && (
        <FormGroup title={_('Default SMB Credential')} titleSize="3">
          <Select
            items={renderSelectItems(credentials, UNSET_VALUE)}
            name="defaultSmbCredential"
            value={defaultSmbCredential}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('credential') && (
        <FormGroup title={_('Default SNMP Credential')} titleSize="3">
          <Select
            items={renderSelectItems(credentials, UNSET_VALUE)}
            name="defaultSnmpCredential"
            value={defaultSnmpCredential}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('credential') && (
        <FormGroup title={_('Default SSH Credential')} titleSize="3">
          <Select
            items={renderSelectItems(credentials, UNSET_VALUE)}
            name="defaultSshCredential"
            value={defaultSshCredential}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('schedule') && (
        <FormGroup title={_('Default Schedule')} titleSize="3">
          <Select
            items={renderSelectItems(schedules, UNSET_VALUE)}
            name="defaultSchedule"
            value={defaultSchedule}
            onChange={onChange}
          />
        </FormGroup>
      )}
      {capabilities.mayAccess('target') && (
        <FormGroup title={_('Default Target')} titleSize="3">
          <Select
            items={renderSelectItems(targets, UNSET_VALUE)}
            name="defaultTarget"
            value={defaultTarget}
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

export default DefaultsPart;
