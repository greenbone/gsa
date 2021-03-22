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

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import CpePage, {ToolBarIcons} from '../detailspage';

setLocale('en');

const cpeObject = Cpe.fromObject(cpeEntity);

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let renewSession;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'cpe:/a:foo',
  }),
}));

beforeEach(() => {
  if (!isDefined(window.URL)) {
    window.URL = {};
  }
  window.URL.createObjectURL = jest.fn();

  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('CPE Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      settings: {
        manualUrl,
        reloadInterval,
      },
      user: {
        currentSettings,
      },
    };

    const id = 'cpe:/a:foo';
    const [mock, resultFunc] = createGetCpeQueryMock(id);
    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock],
    });

    store.dispatch(setTimezone('UTC'));

    const {baseElement} = render(<CpePage id="cpe:/a:foo" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    // get different types of dom elements
    const icons = screen.getAllByTestId('svg-icon');
    const links = screen.getAllByRole('link');
    const detailslinks = screen.getAllByTestId('details-link');
    const headings = baseElement.querySelectorAll('h2');

    // test icon bar
    expect(icons[0]).toHaveAttribute('title', 'Help: CPEs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cpe',
    );

    expect(icons[1]).toHaveAttribute('title', 'CPE List');
    expect(links[1]).toHaveAttribute('href', '/cpes');

    expect(icons[2]).toHaveAttribute('title', 'Export CPE');

    // test title bar
    expect(headings[0]).toHaveTextContent('CPE: foo');
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

    // test tabs
    const tabs = screen.getAllByTestId('entities-tab-title');
    expect(tabs[0]).toHaveTextContent('User Tags');

    // test page content
    expect(baseElement).toHaveTextContent('StatusFINAL');
    expect(baseElement).toHaveTextContent('Deprecated By');
    expect(detailslinks[0]).toHaveTextContent('cpe:/a:foo:bar');

    // severity bar(s)
    const progressBars = screen.getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'High');
    expect(progressBars[0]).toHaveTextContent('9.8 (High)');
    expect(progressBars[1]).toHaveAttribute('title', 'Medium');
    expect(progressBars[1]).toHaveTextContent('5.4 (Medium)');
    expect(progressBars[2]).toHaveAttribute('title', 'High');
    expect(progressBars[2]).toHaveTextContent('9.8 (High)');
    expect(progressBars[3]).toHaveAttribute('title', 'Low');
    expect(progressBars[3]).toHaveTextContent('1.8 (Low)');

    // details
    expect(headings[1]).toHaveTextContent('Reported Vulnerabilities');
    expect(detailslinks[1]).toHaveTextContent('CVE-2020-1234');
    expect(detailslinks[2]).toHaveTextContent('CVE-2020-5678');
    expect(detailslinks[3]).toHaveTextContent('CVE-2019-5678');
  });

  test('should render user tags tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const id = 'cpe:/a:foo';
    const [mock, resultFunc] = createGetCpeQueryMock(id);

    const [
      renewSessionQueryMock,
      renewSessionQueryResult,
    ] = createRenewSessionQueryMock();

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

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    await wait();

    expect(renewSessionQueryResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const id = 'cpe:/a:foo';
    const [mock, resultFunc] = createGetCpeQueryMock(id);
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

    render(<CpePage id="cpe:/a:foo" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = screen.getAllByTestId('svg-icon');

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

    render(
      <ToolBarIcons
        entity={cpeObject}
        onCpeDownloadClick={handleCpeDownload}
      />,
    );

    const icons = screen.getAllByTestId('svg-icon');
    const links = screen.getAllByRole('link');

    expect(icons[0]).toHaveAttribute('title', 'Help: CPEs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cpe',
    );

    expect(links[1]).toHaveAttribute('href', '/cpes');
    expect(icons[1]).toHaveAttribute('title', 'CPE List');
  });
});
