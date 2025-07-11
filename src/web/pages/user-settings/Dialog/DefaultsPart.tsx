/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {
  renderSelectItems,
  UNSET_VALUE,
  RenderSelectItemProps,
} from 'web/utils/Render';

interface Capabilities {
  mayAccess: (capability: string) => boolean;
}

interface DefaultSettingFieldProps {
  capability: string;
  title: string | {toString(): string};
  items?: RenderSelectItemProps[];
  name: string;
  value?: string;
  onChange?: (value: string, name?: string) => void;
}

interface DefaultField {
  capability: string;
  title: string | {toString(): string};
  items?: RenderSelectItemProps[];
  name: string;
  value?: string;
}

interface DefaultsPartProps {
  alerts?: RenderSelectItemProps[];
  credentials?: RenderSelectItemProps[];
  openVasScanConfigs?: RenderSelectItemProps[];
  openVasScanners?: RenderSelectItemProps[];
  portLists?: RenderSelectItemProps[];
  schedules?: RenderSelectItemProps[];
  targets?: RenderSelectItemProps[];
  defaultAlert?: string;
  defaultEsxiCredential?: string;
  defaultOpenvasScanConfig?: string;
  defaultOpenvasScanner?: string;
  defaultPortList?: string;
  defaultSmbCredential?: string;
  defaultSnmpCredential?: string;
  defaultSshCredential?: string;
  defaultSchedule?: string;
  defaultTarget?: string;
  onChange?: (value: string, name?: string) => void;
}

const DefaultSettingField = ({
  capability,
  title,
  items = [],
  name,
  value,
  onChange,
}: DefaultSettingFieldProps) => {
  const capabilities = useCapabilities() as Capabilities;

  if (!capabilities.mayAccess(capability)) {
    return null;
  }

  return (
    <FormGroup title={String(title)}>
      <Select
        items={renderSelectItems(items, UNSET_VALUE)}
        name={name}
        value={value}
        onChange={onChange}
      />
    </FormGroup>
  );
};

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
}: DefaultsPartProps) => {
  const [_] = useTranslation();

  const defaultFields: DefaultField[] = [
    {
      capability: 'alert',
      title: _('Default Alert'),
      items: alerts,
      name: 'defaultAlert',
      value: defaultAlert,
    },
    {
      capability: 'credential',
      title: _('Default ESXi Credential'),
      items: credentials,
      name: 'defaultEsxiCredential',
      value: defaultEsxiCredential,
    },
    {
      capability: 'scanconfig',
      title: _('Default OpenVAS Scan Config'),
      items: openVasScanConfigs,
      name: 'defaultOpenvasScanConfig',
      value: defaultOpenvasScanConfig,
    },
    {
      capability: 'scanner',
      title: _('Default OpenVAS Scanner'),
      items: openVasScanners,
      name: 'defaultOpenvasScanner',
      value: defaultOpenvasScanner,
    },
    {
      capability: 'portlist',
      title: _('Default Port List'),
      items: portLists,
      name: 'defaultPortList',
      value: defaultPortList,
    },
    {
      capability: 'credential',
      title: _('Default SMB Credential'),
      items: credentials,
      name: 'defaultSmbCredential',
      value: defaultSmbCredential,
    },
    {
      capability: 'credential',
      title: _('Default SNMP Credential'),
      items: credentials,
      name: 'defaultSnmpCredential',
      value: defaultSnmpCredential,
    },
    {
      capability: 'credential',
      title: _('Default SSH Credential'),
      items: credentials,
      name: 'defaultSshCredential',
      value: defaultSshCredential,
    },
    {
      capability: 'schedule',
      title: _('Default Schedule'),
      items: schedules,
      name: 'defaultSchedule',
      value: defaultSchedule,
    },
    {
      capability: 'target',
      title: _('Default Target'),
      items: targets,
      name: 'defaultTarget',
      value: defaultTarget,
    },
  ];

  return (
    <>
      {defaultFields.map(field => (
        <DefaultSettingField
          key={field.name}
          capability={field.capability}
          items={field.items}
          name={field.name}
          title={field.title}
          value={field.value}
          onChange={onChange}
        />
      ))}
    </>
  );
};

export default DefaultsPart;
