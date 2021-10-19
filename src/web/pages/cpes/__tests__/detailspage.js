/* Copyright (C) 2021 Greenbone Networks GmbH
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

import CPE from 'gmp/models/cpe';

import Filter from 'gmp/models/filter';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {entityLoadingActions} from 'web/store/entities/cpes';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, wait, fireEvent} from 'web/utils/testing';

import CpePage, {ToolBarIcons} from '../detailspage';

setLocale('en');

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const cpe = CPE.fromElement({
  _id: 'cpe:/a:foo',
  name: 'foo',
  title: 'bar',
  creation_time: '2019-06-24T11:55:30Z',
  modification_time: '2019-06-24T10:12:27Z',
  update_time: '2019-06-24T10:12:27Z',
  cve_refs: '3',
  cves: {
    cve: [
      {entry: {cvss: {base_metrics: {score: 9.7}}, _id: 'CVE-2020-1234'}},
      {entry: {cvss: {base_metrics: {score: 5.4}}, _id: 'CVE-2020-5678'}},
      {entry: {cvss: {base_metrics: {score: 1.8}}, _id: 'CVE-2019-5678'}},
    ],
  },
  severity: 9.8,
  status: 'FINAL',
  nvd_id: '',
});

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
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
  test('should render full Detailspage', () => {
    const getCpe = jest.fn().mockResolvedValue({
      data: cpe,
    });

    const gmp = {
      cpe: {
        get: getCpe,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('cpe:/a:foo', cpe));

    const {baseElement, getAllByTestId} = render(<CpePage id="cpe:/a:foo" />);

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
      'Modified:Mon, Jun 24, 2019 10:12 AM UTC',
    );
    expect(baseElement).toHaveTextContent(
      'Created:Mon, Jun 24, 2019 11:55 AM UTC',
    );

    expect(baseElement).toHaveTextContent(
      'Last updated:Mon, Jun 24, 2019 10:12 AM UTC',
    );

    // test page content
    expect(baseElement).toHaveTextContent('StatusFINAL');

    // severity bar(s)
    const progressBars = getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'High');
    expect(progressBars[0]).toHaveTextContent('9.8 (High)');
    expect(progressBars[1]).toHaveAttribute('title', 'High');
    expect(progressBars[1]).toHaveTextContent('9.7 (High)');
    expect(progressBars[2]).toHaveAttribute('title', 'Medium');
    expect(progressBars[2]).toHaveTextContent('5.4 (Medium)');
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
      data: cpe,
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
      tags: {
        get: getTags,
      },
      settings: {manualUrl, reloadInterval},
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

    store.dispatch(entityLoadingActions.success('cpe:/a:foo', cpe));

    const {baseElement} = render(<CpePage id="cpe:/a:foo" />);

    const spans = baseElement.querySelectorAll('span');

    expect(spans[4]).toHaveTextContent('User Tags');
    fireEvent.click(spans[4]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const exportFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const getCpe = jest.fn().mockReturnValue(
      Promise.resolve({
        data: cpe,
      }),
    );

    const gmp = {
      cpe: {
        get: getCpe,
        export: exportFunc,
      },
      settings: {manualUrl, reloadInterval},
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

    store.dispatch(entityLoadingActions.success('cpe:/a:foo', cpe));

    const {getAllByTestId} = render(<CpePage id="cpe:/a:foo" />);
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CPEs');
    expect(icons[1]).toHaveAttribute('title', 'CPE List');

    expect(icons[2]).toHaveAttribute('title', 'Export CPE');
    fireEvent.click(icons[2]);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(cpe);
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
      <ToolBarIcons entity={cpe} onCpeDownloadClick={handleCpeDownload} />,
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
      <ToolBarIcons entity={cpe} onCpeDownloadClick={handleCpeDownload} />,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: CPEs');
    expect(icons[1]).toHaveAttribute('title', 'CPE List');

    fireEvent.click(icons[2]);
    expect(handleCpeDownload).toHaveBeenCalledWith(cpe);
    expect(icons[2]).toHaveAttribute('title', 'Export CPE');
  });
});
