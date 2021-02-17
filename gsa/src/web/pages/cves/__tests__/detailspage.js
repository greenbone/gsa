/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {setLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';

import Cve from 'gmp/models/cve';

import {entityLoadingActions} from 'web/store/entities/cves';
import {
  createExportCvesByIdsQueryMock,
  createGetCveQueryMock,
  cveEntity,
} from 'web/graphql/__mocks__/cves';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';
import {
  createGetPermissionsQueryMock,
  noPermissions,
} from 'web/graphql/__mocks__/permissions';

import {rendererWith, wait} from 'web/utils/testing';

import CvePage from '../detailspage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'CVE-314',
  }),
}));

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

const entity_v2 = Cve.fromElement({
  _id: 'CVE-2020-9997',
  owner: {
    name: '',
  },
  name: 'CVE-2020-9997',
  comment: '',
  creation_time: '2020-10-22T19:15:00Z',
  modification_time: '2020-10-26T20:27:00Z',
  writable: 0,
  in_use: 0,
  permissions: '',
  update_time: '2020-10-30T11:44:00.000+0000',
  cve: {
    score: 55,
    cvss_vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N',
    description:
      'An information disclosure issue was addressed with improved state management. This issue is fixed in macOS Catalina 10.15.6, watchOS 6.2.8. A malicious application may disclose restricted memory.',
    products: 'cpe:/o:apple:mac_os_x:10.15.5 cpe:/o:apple:watchos:6.2.8',
    nvts: '',
    cert: {
      cert_ref: {
        _type: 'CERT-Bund',
        name: 'CB-K20/0730',
        title: 'Apple macOS: Mehrere Schwachstellen',
      },
    },
    raw_data: {
      entry: {
        _id: 'CVE-2020-9997',
        'vulnerable-software-list': {
          product: [
            'cpe:/o:apple:mac_os_x:10.15.5',
            'cpe:/o:apple:watchos:6.2.8',
          ],
        },
        'cve-id': 'CVE-2020-9997',
        'published-datetime': '2020-10-22T19:15:00+00:00',
        'last-modified-datetime': '2020-10-26T20:27:00+00:00',
        cvss: {
          base_metrics: {
            'integrity-impact': 'NONE',
            'access-complexity': 'MEDIUM',
            'availability-impact': 'NONE',
            'vector-string': 'AV:N/AC:M/Au:N/C:P/I:N/A:N',
            'confidentiality-impact': 'PARTIAL',
            'access-vector': 'NETWORK',
            authentication: 'NONE',
            score: 4.3,
            source: 'http://nvd.nist.gov',
            'generated-on-datetime': '2020-10-26T20:27:00+00:00',
          },
        },
        cvss3: {
          base_metrics: {
            'availability-impact': 'NONE',
            'attack-complexity': 'LOW',
            'vector-string': 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N',
            'integrity-impact': 'NONE',
            'user-interaction': 'REQUIRED',
            'base-score': 5.5,
            'attack-vector': 'LOCAL',
            'privileges-required': 'NONE',
            scope: 'UNCHANGED',
            'confidentiality-impact': 'HIGH',
            'base-severity': 'MEDIUM',
          },
          'generated-on-datetime': '2020-10-26T20:27:00+00:00',
        },
        cwe: {
          _id: 'NVD-CWE-noinfo',
        },
        references: [
          {
            source: 'MISC',
            reference: {
              __text: 'https://support.apple.com/kb/HT211289',
              _href: 'https://support.apple.com/kb/HT211289',
            },
          },
          {
            source: 'MISC',
            reference: {
              __text: 'https://support.apple.com/kb/HT211291',
              _href: 'https://support.apple.com/kb/HT211291',
            },
          },
        ],
        summary:
          'An information disclosure issue was addressed with improved state management. This issue is fixed in macOS Catalina 10.15.6, watchOS 6.2.8. A malicious application may disclose restricted memory.',
      },
    },
  },
});
const cve = Cve.fromObject(cveEntity);

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const entityType = 'cve';
const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let getPermissions;
let renewSession;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('CVE Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const getCve = jest.fn().mockResolvedValue({
      data: cve,
    });

    const gmp = {
      [entityType]: {
        get: getCve,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetCveQueryMock();
    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=314 first=1 rows=-1',
    });
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock],
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    // store.dispatch(entityLoadingActions.success('CVE-314', entity_v2));

    const {baseElement, element, getAllByTestId} = render(
      <CvePage id="CVE-314" />,
    );

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CVEs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cve',
    );

    expect(icons[1]).toHaveAttribute('title', 'CVE List');
    expect(links[1]).toHaveAttribute('href', '/cves');

    expect(icons[2]).toHaveAttribute('title', 'Export CVE');

    expect(baseElement).toHaveTextContent('CVE: foo');

    expect(baseElement).toHaveTextContent('CVE-314');
    expect(baseElement).toHaveTextContent(
      'Published:Mon, Aug 17, 2020 12:18 PM UTC',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Tue, Sep 29, 2020 12:16 PM UTC',
    );
    expect(baseElement).toHaveTextContent(
      'Last updated:Tue, Sep 29, 2020 12:16 PM UTC',
    );

    expect(baseElement).toHaveTextContent('Attack VectorLOCAL');
    expect(baseElement).toHaveTextContent('Attack ComplexityLOW');
    expect(baseElement).toHaveTextContent('Privileges RequiredNONE');
    expect(baseElement).toHaveTextContent('User InteractionREQUIRED');
    expect(baseElement).toHaveTextContent('ScopeUNCHANGED');
    expect(baseElement).toHaveTextContent('Confidentiality ImpactHIGH');
    expect(baseElement).toHaveTextContent('Integrity ImpactNONE');
    expect(baseElement).toHaveTextContent('Availability ImpactNONE');
    const progressBars = getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Medium');
    expect(progressBars[0]).toHaveTextContent('5.5 (Medium)');
    expect(baseElement).toHaveTextContent('References');
    expect(baseElement).toHaveTextContent(
      'MISChttps://support.apple.com/kb/HT211289',
    );
    expect(element).toHaveTextContent(
      'MISChttps://support.apple.com/kb/HT211291',
    );
    expect(baseElement).toHaveTextContent(
      'CERT Advisories referencing this CVE',
    );
    expect(baseElement).toHaveTextContent('CB-K20/0730');
    expect(baseElement).toHaveTextContent(
      'Apple macOS: Mehrere Schwachstellen',
    );
    expect(baseElement).toHaveTextContent('Vulnerable Products');
    expect(baseElement).toHaveTextContent('cpe:/o:apple:mac_os_x:10.15.5');
    expect(baseElement).toHaveTextContent('cpe:/o:apple:watchos:6.2.8');
  });
});
