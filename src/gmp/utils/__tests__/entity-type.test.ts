/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Host from 'gmp/models/host';
import {parseModelFromElement} from 'gmp/models/model';
import Nvt from 'gmp/models/nvt';
import {
  getEntityType,
  pluralizeType,
  normalizeType,
  apiType,
  typeName,
  resourceType,
} from 'gmp/utils/entity-type';

describe('getEntityType function tests', () => {
  test('should return entity type of object', () => {
    const model = {entityType: 'task' as const};

    expect(getEntityType(model)).toEqual('task');
  });

  test('should return entity type of model', () => {
    const model = parseModelFromElement({}, 'task');

    expect(getEntityType(model)).toEqual('task');
  });

  test('should return entity type for info models', () => {
    const model = Nvt.fromElement();

    expect(getEntityType(model)).toEqual('nvt');
  });

  test('should return entity type for asset models', () => {
    const model = Host.fromElement();

    expect(getEntityType(model)).toEqual('host');
  });
});

describe('pluralizeType function tests', () => {
  test('should not pluralize info', () => {
    expect(pluralizeType('info')).toEqual('info');
  });

  test('should not pluralize an already pluralized term', () => {
    expect(pluralizeType('foos')).toEqual('foos');
    expect(pluralizeType('tasks')).toEqual('tasks');
  });

  test('should pluralize term', () => {
    expect(pluralizeType('foo')).toEqual('foos');
    expect(pluralizeType('task')).toEqual('tasks');
  });

  test('should pluralize special plural types', () => {
    expect(pluralizeType('vulnerability')).toEqual('vulns');
    expect(pluralizeType('policy')).toEqual('policies');
  });
});

describe('normalizeType function tests', () => {
  test('should normalize types', () => {
    expect(normalizeType('agent_group')).toEqual('agentgroup');
    expect(normalizeType('agent_installer')).toEqual('agentinstaller');
    expect(normalizeType('cert_bund_adv')).toEqual('certbund');
    expect(normalizeType('config')).toEqual('scanconfig');
    expect(normalizeType('dfn_cert_adv')).toEqual('dfncert');
    expect(normalizeType('oci_image_target')).toEqual('ociimagetarget');
    expect(normalizeType('os')).toEqual('operatingsystem');
    expect(normalizeType('port_list')).toEqual('portlist');
    expect(normalizeType('port_range')).toEqual('portrange');
    expect(normalizeType('report_config')).toEqual('reportconfig');
    expect(normalizeType('report_format')).toEqual('reportformat');
    expect(normalizeType('tls_certificate')).toEqual('tlscertificate');
    expect(normalizeType('vuln')).toEqual('vulnerability');
  });

  test('should pass through already normalize types', () => {
    expect(normalizeType('agent')).toEqual('agent');
    expect(normalizeType('agentgroup')).toEqual('agentgroup');
    expect(normalizeType('agentinstaller')).toEqual('agentinstaller');
    expect(normalizeType('asset')).toEqual('asset');
    expect(normalizeType('audit')).toEqual('audit');
    expect(normalizeType('auditreport')).toEqual('auditreport');
    expect(normalizeType('certbund')).toEqual('certbund');
    expect(normalizeType('cpe')).toEqual('cpe');
    expect(normalizeType('credential')).toEqual('credential');
    expect(normalizeType('cve')).toEqual('cve');
    expect(normalizeType('dfncert')).toEqual('dfncert');
    expect(normalizeType('filter')).toEqual('filter');
    expect(normalizeType('group')).toEqual('group');
    expect(normalizeType('host')).toEqual('host');
    expect(normalizeType('info')).toEqual('info');
    expect(normalizeType('nvt')).toEqual('nvt');
    expect(normalizeType('ociimagetarget')).toEqual('ociimagetarget');
    expect(normalizeType('operatingsystem')).toEqual('operatingsystem');
    expect(normalizeType('note')).toEqual('note');
    expect(normalizeType('permission')).toEqual('permission');
    expect(normalizeType('policy')).toEqual('policy');
    expect(normalizeType('portlist')).toEqual('portlist');
    expect(normalizeType('portrange')).toEqual('portrange');
    expect(normalizeType('report')).toEqual('report');
    expect(normalizeType('reportconfig')).toEqual('reportconfig');
    expect(normalizeType('reportformat')).toEqual('reportformat');
    expect(normalizeType('scanconfig')).toEqual('scanconfig');
    expect(normalizeType('target')).toEqual('target');
    expect(normalizeType('task')).toEqual('task');
    expect(normalizeType('tlscertificate')).toEqual('tlscertificate');
    expect(normalizeType('user')).toEqual('user');
    expect(normalizeType('vulnerability')).toEqual('vulnerability');
  });

  test('should pass through unknown types', () => {
    // @ts-expect-error
    expect(normalizeType('foo')).toEqual('foo');
  });

  test('should pass through undefined', () => {
    expect(normalizeType()).toBeUndefined();
  });
});

describe('apiType function tests', () => {
  test('should convert entity types', () => {
    expect(apiType('agent')).toEqual('agent');
    expect(apiType('agentgroup')).toEqual('agent_group');
    expect(apiType('agentinstaller')).toEqual('agent_installer');
    expect(apiType('audit')).toEqual('task');
    expect(apiType('auditreport')).toEqual('report');
    expect(apiType('certbund')).toEqual('info');
    expect(apiType('cpe')).toEqual('info');
    expect(apiType('cve')).toEqual('info');
    expect(apiType('dfncert')).toEqual('info');
    expect(apiType('host')).toEqual('asset');
    expect(apiType('nvt')).toEqual('info');
    expect(apiType('ociimagetarget')).toEqual('oci_image_target');
    expect(apiType('operatingsystem')).toEqual('asset');
    expect(apiType('policy')).toEqual('config');
    expect(apiType('portlist')).toEqual('port_list');
    expect(apiType('portrange')).toEqual('port_range');
    expect(apiType('reportconfig')).toEqual('report_config');
    expect(apiType('reportformat')).toEqual('report_format');
    expect(apiType('scanconfig')).toEqual('config');
    expect(apiType('tlscertificate')).toEqual('tls_certificate');
    expect(apiType('vulnerability')).toEqual('vuln');
  });

  test('should pass through already converted types', () => {
    expect(apiType('agent')).toEqual('agent');
    expect(apiType('agent_group')).toEqual('agent_group');
    expect(apiType('agent_installer')).toEqual('agent_installer');
    expect(apiType('asset')).toEqual('asset');
    expect(apiType('config')).toEqual('config');
    expect(apiType('info')).toEqual('info');
    expect(apiType('oci_image_target')).toEqual('oci_image_target');
    expect(apiType('port_list')).toEqual('port_list');
    expect(apiType('port_range')).toEqual('port_range');
    expect(apiType('report_config')).toEqual('report_config');
    expect(apiType('report_format')).toEqual('report_format');
    expect(apiType('report')).toEqual('report');
    expect(apiType('task')).toEqual('task');
    expect(apiType('tls_certificate')).toEqual('tls_certificate');
    expect(apiType('vuln')).toEqual('vuln');
  });

  test('should pass through unknown types', () => {
    // @ts-expect-error
    expect(apiType('foo')).toEqual('foo');
  });

  test('should pass through undefined', () => {
    expect(apiType()).toBeUndefined();
  });
});

describe('typeName function tests', () => {
  test('should return Unknown unknown types', () => {
    // @ts-expect-error
    expect(typeName('foo')).toEqual('Unknown');
    expect(typeName()).toEqual('Unknown');
  });

  test('should convert entity types', () => {
    expect(typeName('agent_group')).toEqual('Agent Group');
    expect(typeName('agent_installer')).toEqual('Agent Installer');
    expect(typeName('agent')).toEqual('Agent');
    expect(typeName('agentgroup')).toEqual('Agent Group');
    expect(typeName('agentinstaller')).toEqual('Agent Installer');
    expect(typeName('alert')).toEqual('Alert');
    expect(typeName('asset')).toEqual('Asset');
    expect(typeName('audit_report')).toEqual('Audit Report');
    expect(typeName('audit')).toEqual('Audit');
    expect(typeName('auditreport')).toEqual('Audit Report');
    expect(typeName('cert_bund_adv')).toEqual('CERT-Bund Advisory');
    expect(typeName('certbund')).toEqual('CERT-Bund Advisory');
    expect(typeName('config')).toEqual('Scan Config');
    expect(typeName('cpe')).toEqual('CPE');
    expect(typeName('credential')).toEqual('Credential');
    expect(typeName('cve')).toEqual('CVE');
    expect(typeName('dfn_cert_adv')).toEqual('DFN-CERT Advisory');
    expect(typeName('dfncert')).toEqual('DFN-CERT Advisory');
    expect(typeName('filter')).toEqual('Filter');
    expect(typeName('group')).toEqual('Group');
    expect(typeName('host')).toEqual('Host');
    expect(typeName('info')).toEqual('Info');
    expect(typeName('oci_image_target')).toEqual('OCI Image Target');
    expect(typeName('ociimagetarget')).toEqual('OCI Image Target');
    expect(typeName('operatingsystem')).toEqual('Operating System');
    expect(typeName('override')).toEqual('Override');
    expect(typeName('os')).toEqual('Operating System');
    expect(typeName('note')).toEqual('Note');
    expect(typeName('nvt')).toEqual('NVT');
    expect(typeName('permission')).toEqual('Permission');
    expect(typeName('policy')).toEqual('Policy');
    expect(typeName('port_list')).toEqual('Port List');
    expect(typeName('port_range')).toEqual('Port Range');
    expect(typeName('portlist')).toEqual('Port List');
    expect(typeName('portrange')).toEqual('Port Range');
    expect(typeName('report')).toEqual('Report');
    expect(typeName('report_config')).toEqual('Report Config');
    expect(typeName('reportconfig')).toEqual('Report Config');
    expect(typeName('report_format')).toEqual('Report Format');
    expect(typeName('reportformat')).toEqual('Report Format');
    expect(typeName('result')).toEqual('Result');
    expect(typeName('role')).toEqual('Role');
    expect(typeName('scanconfig')).toEqual('Scan Config');
    expect(typeName('scanner')).toEqual('Scanner');
    expect(typeName('schedule')).toEqual('Schedule');
    expect(typeName('tag')).toEqual('Tag');
    expect(typeName('target')).toEqual('Target');
    expect(typeName('task')).toEqual('Task');
    expect(typeName('ticket')).toEqual('Ticket');
    expect(typeName('tls_certificate')).toEqual('TLS Certificate');
    expect(typeName('tlscertificate')).toEqual('TLS Certificate');
    expect(typeName('user')).toEqual('User');
    expect(typeName('vuln')).toEqual('Vulnerability');
    expect(typeName('vulnerability')).toEqual('Vulnerability');
  });
});

describe('resourceType function tests', () => {
  test('should return undefined for undefined or empty type', () => {
    expect(resourceType(undefined)).toBeUndefined();
    // @ts-expect-error
    expect(resourceType('')).toBeUndefined();
  });

  test('should return resource type for known types', () => {
    expect(resourceType('audit')).toEqual('audit');
    expect(resourceType('auditreport')).toEqual('audit_report');
    expect(resourceType('certbund')).toEqual('cert_bund_adv');
    expect(resourceType('cpe')).toEqual('cpe');
    expect(resourceType('cve')).toEqual('cve');
    expect(resourceType('dfncert')).toEqual('dfn_cert_adv');
    expect(resourceType('operatingsystem')).toEqual('os');
    expect(resourceType('host')).toEqual('host');
    expect(resourceType('nvt')).toEqual('nvt');
    expect(resourceType('policy')).toEqual('policy');
    expect(resourceType('scanconfig')).toEqual('config');
  });

  test('should support other valid resource types', () => {
    expect(resourceType('credential')).toEqual('credential');
    expect(resourceType('filter')).toEqual('filter');
    expect(resourceType('group')).toEqual('group');
    expect(resourceType('note')).toEqual('note');
    expect(resourceType('permission')).toEqual('permission');
    expect(resourceType('portlist')).toEqual('port_list');
    expect(resourceType('report')).toEqual('report');
    expect(resourceType('reportconfig')).toEqual('report_config');
    expect(resourceType('reportformat')).toEqual('report_format');
    expect(resourceType('target')).toEqual('target');
    expect(resourceType('task')).toEqual('task');
    expect(resourceType('tlscertificate')).toEqual('tls_certificate');
    expect(resourceType('vulnerability')).toEqual('vuln');
  });

  test('should convert non supported resource types', () => {
    // the following types are not valid resource types for get_resource_names at the moment
    expect(resourceType('agent')).toEqual('agent');
    expect(resourceType('agentgroup')).toEqual('agent_group');
    expect(resourceType('agentinstaller')).toEqual('agent_installer');
    expect(resourceType('asset')).toEqual('asset');
    expect(resourceType('info')).toEqual('info');
    expect(resourceType('ociimagetarget')).toEqual('oci_image_target');
    expect(resourceType('portrange')).toEqual('port_range');
    expect(resourceType('user')).toEqual('user');
  });

  test('should pass through unknown types', () => {
    // @ts-expect-error
    expect(resourceType('foo')).toEqual('foo');
    // @ts-expect-error
    expect(resourceType('bar')).toEqual('bar');
  });
});
