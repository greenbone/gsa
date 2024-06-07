/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {setLocale} from 'gmp/locale/lang';

import Report from 'gmp/models/report';

setLocale('en');

// Task
const task1 = {
  _id: '314',
  name: 'foo',
  comment: 'bar',
  target: {_id: '159'},
};

// Results
const result1 = {
  _id: '101',
  name: 'Result 1',
  owner: {name: 'admin'},
  comment: 'Comment 1',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '123.456.78.910'},
  port: '80/tcp',
  nvt: {
    _oid: '201',
    type: 'nvt',
    name: 'nvt1',
    tags: 'solution_type=Mitigation',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-1234'}]},
  },
  threat: 'High',
  severity: 10.0,
  qod: {value: 80},
  detection: {
    result: {
      details: {
        detail: [{name: 'product', value: 'cpe:/a: 123'}],
      },
    },
  },
};

const result2 = {
  _id: '102',
  name: 'Result 2',
  owner: {name: 'admin'},
  comment: 'Comment 2',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '109.876.54.321'},
  port: '80/tcp',
  nvt: {
    _oid: '202',
    type: 'nvt',
    name: 'nvt2',
    tags: 'solution_type=VendorFix',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-5678'}]},
  },
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 70},
  detection: {
    result: {
      details: {
        detail: [{name: 'product', value: 'cpe:/a: 456'}],
      },
    },
  },
};

const result3 = {
  _id: '103',
  name: 'Result 3',
  owner: {name: 'admin'},
  comment: 'Comment 3',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '109.876.54.321'},
  port: '80/tcp',
  nvt: {
    _oid: '201',
    type: 'nvt',
    name: 'nvt1',
    tags: 'solution_type=Mitigation',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-1234'}]},
    solution: {
      _type: 'Mitigation',
    },
  },
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 80},
};

// Hosts
export const host1 = {
  ip: '123.456.78.910',
  asset: {_asset_id: '123'},
  start: '2019-06-03T11:00:22Z',
  end: '2019-06-03T11:15:14Z',
  port_count: {page: 10},
  result_count: {
    page: 50,
    hole: {page: 14},
    warning: {page: 30},
    info: {page: 5},
    log: {page: 0},
    false_positive: {page: 1},
  },
  detail: [
    {name: 'best_os_cpe', value: 'cpe:/foo/bar'},
    {name: 'best_os_txt', value: 'Foo OS'},
    {name: 'App', value: 'cpe:/a: 123'},
    {name: 'App', value: 'cpe:/a: 789'},
    {name: 'App', value: 'cpe:/a: 101'},
    {name: 'cpe:/a: 123', value: 'ab'},
    {name: 'cpe:/a: 123', value: 'cd'},
    {name: 'traceroute', value: '1.1.1.1,2.2.2.2,3.3.3.3'},
    {name: 'hostname', value: 'foo.bar'},
    {name: 'Auth-SSH-Success'},
    {name: 'SSLInfo', value: '1234::123456'},
    {
      name: 'SSLDetails:123456',
      value:
        'issuer:CN=foo|serial:abcd|notBefore:20190130T201714|notAfter:20190801T201714',
    },
    {
      name: 'Closed CVE',
      value: 'CVE-2000-1234',
      source: {
        type: 'openvas',
        name: '201',
        description: 'This is a description',
      },
      extra: '10.0',
    },
  ],
};

export const host2 = {
  ip: '109.876.54.321',
  start: '2019-06-03T11:15:14Z',
  end: '2019-06-03T11:31:23Z',
  port_count: {page: 15},
  result_count: {
    page: 40,
    hole: {page: 5},
    warning: {page: 30},
    info: {page: 0},
    log: {page: 5},
    false_positive: {page: 0},
  },
  detail: [
    {name: 'best_os_cpe', value: 'cpe:/lorem/ipsum'},
    {name: 'best_os_txt', value: 'Lorem OS'},
    {name: 'App', value: 'cpe:/a: 123'},
    {name: 'App', value: 'cpe:/a: 456'},
    {name: 'traceroute', value: '1.1.1.1,2.2.2.2'},
    {name: 'hostname', value: 'lorem.ipsum'},
    {name: 'Auth-SSH-Failure'},
    {name: 'SSLInfo', value: '5678::654321'},
    {
      name: 'SSLDetails:654321',
      value:
        'issuer:CN=bar|serial:dcba|notBefore:20190330T201714|notAfter:20191001T201714',
    },
    {
      name: 'Closed CVE',
      value: 'CVE-2000-5678',
      source: {
        type: 'openvas',
        name: '202',
        description: 'This is another description',
      },
      extra: '5.0',
    },
  ],
};

// Ports
const port1 = {
  host: '1.1.1.1',
  __text: '123/tcp',
  severity: 10.0,
  threat: 'High',
};
const port2 = {
  host: '2.2.2.2',
  __text: '456/tcp',
  severity: 5.0,
  threat: 'Medium',
};

// Errors
const error1 = {
  host: {
    __text: '123.456.78.910',
    asset: {_asset_id: '123'},
  },
  port: '123/tcp',
  description: 'This is an error.',
  nvt: {
    _oid: '314',
    name: 'NVT1',
  },
};

const error2 = {
  host: {
    __text: '109.876.54.321',
    asset: {_asset_id: '109'},
  },
  port: '456/tcp',
  description: 'This is another error.',
  nvt: {
    _oid: '159',
    name: 'NVT2',
  },
};

// TLS certificates
const tlsCertificate1 = {
  name: '57610B6A3C73866870678E638C7825743145B24',
  certificate: {
    __text: '66870678E638C7825743145B247554E0D92C94',
    _format: 'DER',
  },
  data: 'MIIDSzCCAjOgAwIBAgIJALScVB/zqOLZMA0GCSqGSIb3DQ',
  sha256_fingerprint: '57610B6A3C73866870678E638C78',
  md5_fingerprint: 'fa:a9:9d:f2:28:cc:2c:c0:80:16',
  activation_time: '2019-08-10T12:51:27Z',
  expiration_time: '2019-09-10T12:51:27Z',
  valid: true,
  subject_dn: 'CN=LoremIpsumSubject1 C=Dolor',
  issuer_dn: 'CN=LoremIpsumIssuer1 C=Dolor',
  serial: '00B49C541FF5A8E1D9',
  host: {ip: '192.168.9.90', hostname: 'foo.bar'},
  ports: {port: ['4021', '4023']},
};

const tlsCertificate2 = {
  name: 'C137E9D559CC95ED130011FE4012DE56CAE2F8',
  certificate: {
    __text: 'MIICGTCCAYICCQDDh8Msu4YfXDANBgkqhkiG9w0B',
    _format: 'DER',
  },
  sha256_fingerprint: 'C137E9D559CC95ED130011FE4012',
  md5_fingerprint: '63:70:d6:65:17:32:01:66:9e:7d:c4',
  activation_time: 'unlimited',
  expiration_time: 'undefined',
  valid: false,
  subject_dn: 'CN=LoremIpsumSubject2 C=Dolor',
  issuer_dn: 'CN=LoremIpsumIssuer2 C=Dolor',
  serial: '00C387C32CBB861F5C',
  host: {ip: '191.164.9.93', hostname: ''},
  ports: {port: ['8445', '5061']},
};

export const getMockReport = () => {
  const report = {
    _id: '1234',
    scan_run_status: 'Done',
    scan_start: '2019-06-03T11:00:22Z',
    scan_end: '2019-06-03T11:31:23Z',
    timestamp: '2019-06-03T11:00:22Z',
    timezone: 'UTC',
    timezone_abbrev: 'UTC',
    task: task1,
    closed_cves: {count: 0},
    vulns: {count: 0},
    apps: {count: 4},
    os: {count: 2},
    ssl_certs: {count: 2},
    result_count: {__text: 3, full: 3, filtered: 2},
    results: {result: [result1, result2, result3]},
    hosts: {count: 2},
    host: [host1, host2],
    tls_certificates: {
      tls_certificate: [tlsCertificate1, tlsCertificate2],
    },
    ports: {
      count: 2,
      port: [port1, port2],
    },
    errors: {
      count: 2,
      error: [error1, error2],
    },
  };

  const entity = Report.fromElement({
    report: report,
    creation_time: '2019-06-02T12:00:22Z',
    modification_time: '2019-06-03T11:00:22Z',
    name: '2019-06-03T11:00:22Z',
    owner: {name: 'admin'},
    _id: '1234',
  });

  return {
    entity,
    report: entity.report,
    results: entity.report.results,
    hosts: entity.report.hosts,
    ports: entity.report.ports,
    applications: entity.report.applications,
    operatingsystems: entity.report.operatingsystems,
    cves: entity.report.cves,
    closedCves: entity.report.closedCves,
    tlsCertificates: entity.report.tlsCertificates,
    errors: entity.report.errors,
    task: entity.report.task,
  };
};
