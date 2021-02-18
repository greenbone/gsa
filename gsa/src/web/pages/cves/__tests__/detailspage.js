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

import Filter from 'gmp/models/filter';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {
  createExportCvesByIdsQueryMock,
  createGetCveQueryMock,
  cveEntity,
} from 'web/graphql/__mocks__/cves';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {rendererWith, wait, fireEvent} from 'web/utils/testing';

import CvePage, {ToolBarIcons} from '../detailspage';

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

const cve = Cve.fromObject(cveEntity);

const caps = new Capabilities(['everything']);

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

    const {baseElement, getAllByTestId} = render(<CvePage id="CVE-314" />);

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
    expect(baseElement).toHaveTextContent('TESTfoo bar');
    expect(baseElement).toHaveTextContent('TEST2bar baz');
    expect(baseElement).toHaveTextContent(
      'CERT Advisories referencing this CVE',
    );
    expect(baseElement).toHaveTextContent('CB-1');
    expect(baseElement).toHaveTextContent('blooob');
    expect(baseElement).toHaveTextContent('CB-2');
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('Vulnerable Products');
    expect(baseElement).toHaveTextContent('cpe:/o:ab:c');
    expect(baseElement).toHaveTextContent('cpe:/o:a:bc');
  });

  test('should render user tags tab', async () => {
    const getCve = jest.fn().mockResolvedValue({
      data: cve,
    });

    const getTags = jest.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = {
      [entityType]: {
        get: getCve,
      },
      permissions: {
        get: getPermissions,
      },
      tags: {
        get: getTags,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetCveQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<CvePage id="CVE-314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[4]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const getCve = jest.fn().mockReturnValue(
      Promise.resolve({
        data: cve,
      }),
    );

    const gmp = {
      [entityType]: {
        get: getCve,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetCveQueryMock('CVE-314', cveEntity);
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportCvesByIdsQueryMock(['CVE-314']);
    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, exportQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<CvePage id="CVE-314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CVEs');
    expect(icons[1]).toHaveAttribute('title', 'CVE List');

    expect(icons[2]).toHaveAttribute('title', 'Export CVE');
    fireEvent.click(icons[2]);
    expect(exportQueryResult).toHaveBeenCalled();
  });
});

describe('CVEs ToolBarIcons tests', () => {
  test('should render', () => {
    const handleCveDownload = jest.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ToolBarIcons entity={cve} onCveDownloadClick={handleCveDownload} />,
    );

    expect(element).toMatchSnapshot();

    const links = element.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CVEs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cve',
    );

    expect(links[1]).toHaveAttribute('href', '/cves');
    expect(icons[1]).toHaveAttribute('title', 'CVE List');
  });

  test('should call click handlers', () => {
    const handleCveDownload = jest.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons entity={cve} onCveDownloadClick={handleCveDownload} />,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CVEs');
    expect(icons[1]).toHaveAttribute('title', 'CVE List');

    fireEvent.click(icons[2]);
    expect(handleCveDownload).toHaveBeenCalledWith(cve);
    expect(icons[2]).toHaveAttribute('title', 'Export CVE');
  });
});
