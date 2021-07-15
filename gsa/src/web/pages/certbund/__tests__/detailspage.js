/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
import {act} from 'react-dom/test-utils';
import {setLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import CertBundAdv from 'gmp/models/certbund';

import {entityLoadingActions} from 'web/store/entities/certbund';
import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith, screen, fireEvent} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

const cert = CertBundAdv.fromElement({
  _id: 'CB-K1/0001',
  name: 'CB-K1/0001',
  comment: '',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  permissions: [],
  cert_bund_adv: {
    title: 'test_cert',
    summary: 'summary',
    score: 72,
    max_cvss: 7.2,
    cve_refs: 2,
    raw_data: {
      Advisory: {
        AggregatedCVSSScoreSet: {
          ScoreSet: {
            BaseScore: '5.7',
            TemporalScore: '4.2',
            Vector: 'AV:L/AC:L/Au:S/C:C/I:P/A:P/E:U/RL:OF/RC:ND',
          },
        },
        CVEList: {
          CVE: ['CVE-2020-00001', 'CVE-2020-00002'],
        },
        CategoryTree: [
          'Betriebssystem/Linux_Unix/Debian',
          'Betriebssystem/Linux_Unix/Ubuntu',
          'Betriebssystem/Linux_Unix/RedHat',
          'Betriebssystem/Linux_Unix/SuSE',
        ],
        Description: {
          Headline: 'Beschreibung',
          Element: [
            {
              TextBlock: 'Descriptive.',
            },
            {
              TextBlock: 'Describing description.',
            },
            {
              Infos: {
                Info: [
                  {
                    _Info_Issuer: 'Mailing list OSS-Security vom 2020-12-10',
                    _Info_URL: 'https://seclists.org/oss-sec/2020/q4/202',
                  },
                  {
                    _Info_Issuer:
                      'SUSE Security Update SUSE-SU-2021:0096-1 vom 2021-01-13',
                    _Info_URL:
                      'https://lists.suse.com/pipermail/sle-security-updates/2021-January/008187.html',
                  },
                  {
                    _Info_Issuer:
                      'SUSE Security Update SUSE-SU-2021:0095-1 vom 2021-01-13',
                    _Info_URL:
                      'https://lists.suse.com/pipermail/sle-security-updates/2021-January/008189.html',
                  },
                ],
              },
            },
          ],
        },
        Effect: 'NotRated',
        MetaTag: {
          id: '2020-12-072',
        },
        Platform: 'Linux, NetApp Appliance',
        Ref_Num: {
          update: '3',
          __text: 'CB-K1/0001',
        },
        Reference_Source:
          'CentOS Security Advisory CESA-2021:0856 vom 2021-03-19',
        Reference_URL:
          'http://centos-announce.2309468.n4.nabble.com/CentOS-announce-CESA-2021-0856-Important-CentOS-7-kernel-Security-Update-tp4646164.html',
        RemoteAttack: 'no',
        RevisionHistory: {
          Revision: [
            {
              Date: '2021-01-14T13:30:00+01:00',
              Description: 'Neue Updates',
              Number: '3',
            },
            {
              Date: '2021-01-13T13:30:00+01:00',
              Description: 'Neues Update',
              Number: '2',
            },
          ],
        },
        Risk: 'medium',
        Software: 'foo, bar, baz',
      },
    },
  },
});

const caps = new Capabilities(['everything']);

const reloadInterval = 1;
const manualUrl = 'test/';

let currentSettings;
let renewSession;
let getCertBund;
let getEntities;

beforeEach(() => {
  if (!isDefined(window.URL)) {
    window.URL = {};
  }
  window.URL.createObjectURL = jest.fn();

  // mock gmp commands
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getCertBund = jest.fn().mockResolvedValue({
    data: cert,
  });
});

describe('CERT-Bund Advisory Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const gmp = {
      certbund: {
        get: getCertBund,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, renewSession},
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));

    store.dispatch(entityLoadingActions.success('CB-K1/0001', cert));

    const {baseElement, element, getAllByTestId} = render(
      <Detailspage id="CB-K1/0001" />,
    );

    expect(element).toHaveTextContent('CERT-Bund Advisory: CB-K1/0001');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');
    const headings = element.querySelectorAll('h2');
    const detailslinks = getAllByTestId('details-link');

    expect(icons[0]).toHaveAttribute('title', 'Help: CERT-Bund Advisories');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cert-bund-advisories',
    );

    expect(icons[1]).toHaveAttribute('title', 'CERT-Bund Advisories');
    expect(links[1]).toHaveAttribute('href', '/certbunds');

    expect(element).toHaveTextContent('CB-K1/0001');
    expect(element).toHaveTextContent('Tue, Jul 16, 2019 8:31 AM CEST');
    expect(element).toHaveTextContent('Tue, Jul 16, 2019 8:44 AM CEST');
    expect(element).toHaveTextContent('(Global Object)');

    expect(element).toHaveTextContent('Titletest_cert');
    expect(element).toHaveTextContent('Softwarefoo, bar, baz');
    expect(element).toHaveTextContent('PlatformLinux, NetApp Appliance');
    expect(element).toHaveTextContent('Remote Attackno');
    // expect(element).toHaveTextContent('Severity, NetApp Appliance');
    expect(element).toHaveTextContent('CERT-Bund Risk Ratingmedium');
    expect(element).toHaveTextContent('Reference SourceCentOS');
    expect(element).toHaveTextContent('Reference URL');
    expect(links[2]).toHaveAttribute(
      'href',
      'http://centos-announce.2309468.n4.nabble.com/CentOS-announce-CESA-2021-0856-Important-CentOS-7-kernel-Security-Update-tp4646164.html',
    );

    expect(headings[1]).toHaveTextContent('Revision History');
    expect(element).toHaveTextContent('RevisionDateDescription');
    expect(element).toHaveTextContent(
      '3Thu, Jan 14, 2021 1:30 PM CETNeue Updates',
    );
    expect(element).toHaveTextContent(
      '2Wed, Jan 13, 2021 1:30 PM CETNeues Update',
    );

    expect(headings[2]).toHaveTextContent('Categories');
    expect(element).toHaveTextContent('Betriebssystem/Linux_Unix/Debian');
    expect(element).toHaveTextContent('Betriebssystem/Linux_Unix/Ubuntu');
    expect(element).toHaveTextContent('Betriebssystem/Linux_Unix/RedHat');
    expect(element).toHaveTextContent('Betriebssystem/Linux_Unix/SuSE');

    expect(headings[3]).toHaveTextContent('Description');
    expect(element).toHaveTextContent('Descriptive.Describing description.');

    expect(headings[4]).toHaveTextContent('References CVEs');
    expect(detailslinks[0]).toHaveAttribute('href', '/cve/CVE-2020-00001');
    expect(detailslinks[1]).toHaveAttribute('href', '/cve/CVE-2020-00002');

    expect(headings[5]).toHaveTextContent('Other Links');
    expect(element).toHaveTextContent(
      'Mailing list OSS-Security vom 2020-12-10',
    );
    expect(links[5]).toHaveAttribute(
      'href',
      'https://seclists.org/oss-sec/2020/q4/202',
    );
    expect(element).toHaveTextContent(
      'SUSE Security Update SUSE-SU-2021:0095-1 vom 2021-01-13',
    );
    expect(links[6]).toHaveAttribute(
      'href',
      'https://lists.suse.com/pipermail/sle-security-updates/2021-January/008187.html',
    );
    expect(element).toHaveTextContent(
      'SUSE Security Update SUSE-SU-2021:0096-1 vom 2021-01-13',
    );
    expect(links[7]).toHaveAttribute(
      'href',
      'https://lists.suse.com/pipermail/sle-security-updates/2021-January/008189.html',
    );
  });

  test('should render user tags tab', () => {
    const gmp = {
      certbund: {
        get: getCertBund,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, renewSession},
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));

    store.dispatch(entityLoadingActions.success('CB-K1/0001', cert));

    const {baseElement, element} = render(<Detailspage id="CB-K1/0001" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[4]);

    expect(element).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const exportFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      certbund: {
        get: getCertBund,
        export: exportFunc,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));

    store.dispatch(entityLoadingActions.success('CB-K1/0001', cert));

    const {getAllByTestId} = render(<Detailspage id="CB-K1/0001" />);

    const icons = getAllByTestId('svg-icon');

    await act(async () => {
      fireEvent.click(icons[2]);
      expect(exportFunc).toHaveBeenCalledWith(cert);
      expect(icons[2]).toHaveAttribute('title', 'Export CERT-Bund Advisory');
    });
  });
});

describe('CERT-Bund Advisory ToolBarIcons tests', () => {
  test('should render', () => {
    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    const {element} = render(<ToolBarIcons entity={cert} />);

    const links = element.querySelectorAll('a');
    const icons = screen.getAllByTestId('svg-icon');

    expect(icons.length).toBe(3);

    expect(icons[0]).toHaveAttribute('title', 'Help: CERT-Bund Advisories');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cert-bund-advisories',
    );

    expect(screen.getAllByTitle('CERT-Bund Advisories')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/certbunds');

    expect(
      screen.getAllByTitle('Export CERT-Bund Advisory')[0],
    ).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleCertBundAdvDownloadClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={cert}
        onCertBundAdvDownloadClick={handleCertBundAdvDownloadClick}
      />,
    );

    fireEvent.click(screen.getAllByTitle('Export CERT-Bund Advisory')[0]);
    expect(handleCertBundAdvDownloadClick).toHaveBeenCalledWith(cert);
  });
});
