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

import Cpe from 'gmp/models/cpe';

import Filter from 'gmp/models/filter';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {
  createExportCpesByIdsQueryMock,
  createGetCpeQueryMock,
  cpeEntity,
} from 'web/graphql/__mocks__/cpes';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {rendererWith, wait, fireEvent} from 'web/utils/testing';

import CpePage, {ToolBarIcons} from '../detailspage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'cpe:/a:foo',
  }),
}));

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

const cpeObject = Cpe.fromObject(cpeEntity);

const caps = new Capabilities(['everything']);

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

describe('CPE Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const getCpe = jest.fn().mockResolvedValue({
      data: cpeObject,
    });

    const gmp = {
      cpe: {
        get: getCpe,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetCpeQueryMock();
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

    const {baseElement, getAllByTestId} = render(<CpePage id="cpe:/a:foo" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const links = baseElement.querySelectorAll('a');

    // test icon bar
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CPEs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cpe',
    );

    expect(icons[1]).toHaveAttribute('title', 'CPE List');
    expect(links[1]).toHaveAttribute('href', '/cpes');

    expect(icons[2]).toHaveAttribute('title', 'Export CPE');

    // test title bar
    expect(baseElement).toHaveTextContent('CPE: foo');

    expect(baseElement).toHaveTextContent('cpe:/a:foo');
    expect(baseElement).toHaveTextContent(
      'Modified:Tue, Sep 29, 2020 12:16 PM UTC',
    );
    expect(baseElement).toHaveTextContent(
      'Created:Mon, Aug 17, 2020 12:18 PM UTC',
    );

    expect(baseElement).toHaveTextContent(
      'Last updated:Tue, Sep 29, 2020 12:16 PM UTC',
    );

    // test page content
    expect(baseElement).toHaveTextContent('StatusFINAL');
    expect(baseElement).toHaveTextContent('Deprecated Bycpe:/a:foo:bar');

    // severity bar(s)
    const progressBars = getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'High');
    expect(progressBars[0]).toHaveTextContent('9.8 (High)');
    expect(progressBars[1]).toHaveAttribute('title', 'Medium');
    expect(progressBars[1]).toHaveTextContent('5.4 (Medium)');
    expect(progressBars[2]).toHaveAttribute('title', 'High');
    expect(progressBars[2]).toHaveTextContent('9.8 (High)');
    expect(progressBars[3]).toHaveAttribute('title', 'Low');
    expect(progressBars[3]).toHaveTextContent('1.8 (Low)');

    // details
    expect(baseElement).toHaveTextContent('Reported Vulnerabilities');
    expect(baseElement).toHaveTextContent('CVE-2020-1234');
    expect(baseElement).toHaveTextContent('CVE-2020-5678');
    expect(baseElement).toHaveTextContent('CVE-2019-5678');
  });

  test('should render user tags tab', async () => {
    const getCpe = jest.fn().mockResolvedValue({
      data: cpeObject,
    });

    const getTags = jest.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = {
      cpe: {
        get: getCpe,
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

    const [mock, resultFunc] = createGetCpeQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<CpePage id="cpe:/a:foo" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[4]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const getCpe = jest.fn().mockReturnValue(
      Promise.resolve({
        data: cpeObject,
      }),
    );

    const gmp = {
      cpe: {
        get: getCpe,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetCpeQueryMock('cpe:/a:foo', cpeEntity);
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportCpesByIdsQueryMock(['cpe:/a:foo']);
    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, exportQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<CpePage id="cpe:/a:foo" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CPEs');
    expect(icons[1]).toHaveAttribute('title', 'CPE List');

    expect(icons[2]).toHaveAttribute('title', 'Export CPE');
    fireEvent.click(icons[2]);
    expect(exportQueryResult).toHaveBeenCalled();
  });
});

describe('CPEs ToolBarIcons tests', () => {
  test('should render', () => {
    const handleCpeDownload = jest.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ToolBarIcons
        entity={cpeObject}
        onCpeDownloadClick={handleCpeDownload}
      />,
    );

    const links = element.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CPEs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cpe',
    );

    expect(links[1]).toHaveAttribute('href', '/cpes');
    expect(icons[1]).toHaveAttribute('title', 'CPE List');
  });

  test('should call click handlers', () => {
    const handleCpeDownload = jest.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={cpeObject}
        onCpeDownloadClick={handleCpeDownload}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CPEs');
    expect(icons[1]).toHaveAttribute('title', 'CPE List');

    fireEvent.click(icons[2]);
    expect(handleCpeDownload).toHaveBeenCalledWith(cpeObject);
    expect(icons[2]).toHaveAttribute('title', 'Export CPE');
  });
});
