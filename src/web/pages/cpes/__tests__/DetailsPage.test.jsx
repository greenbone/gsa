/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import CPE from 'gmp/models/cpe';
import Filter from 'gmp/models/filter';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import CpePage, {ToolBarIcons} from 'web/pages/cpes/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/cpes';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, wait, fireEvent, screen} from 'web/utils/Testing';

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
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse);

  renewSession = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('CPE DetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const getCpe = testing.fn().mockResolvedValue({
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

    const {baseElement} = render(<CpePage id="cpe:/a:foo" />);

    const links = baseElement.querySelectorAll('a');
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: CPEs',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cpe',
    );

    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'CPE List',
    );
    expect(links[1]).toHaveAttribute('href', '/cpes');
    expect(screen.getByTestId('export-icon')).toHaveAttribute(
      'title',
      'Export CPE',
    );

    // test title bar
    expect(baseElement).toHaveTextContent('CPE: foo');

    expect(baseElement).toHaveTextContent('cpe:/a:foo');
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 24, 2019 10:12 AM Coordinated Universal Time',
    );
    expect(baseElement).toHaveTextContent(
      'Created:Mon, Jun 24, 2019 11:55 AM Coordinated Universal Time',
    );

    expect(baseElement).toHaveTextContent(
      'Last updated:Mon, Jun 24, 2019 10:12 AM Coordinated Universal Time',
    );

    // test page content
    expect(baseElement).toHaveTextContent('StatusFINAL');

    // severity bar(s)
    const progressBars = screen.getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Critical');
    expect(progressBars[0]).toHaveTextContent('9.8 (Critical)');
    expect(progressBars[1]).toHaveAttribute('title', 'Critical');
    expect(progressBars[1]).toHaveTextContent('9.7 (Critical)');
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
    const getCpe = testing.fn().mockResolvedValue({
      data: cpe,
    });

    const getTags = testing.fn().mockResolvedValue({
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
    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const getCpe = testing.fn().mockResolvedValue({
      data: cpe,
    });

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

    render(<CpePage id="cpe:/a:foo" />);
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: CPEs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'CPE List',
    );

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export CPE');
    fireEvent.click(exportIcon);
    await wait();
    expect(exportFunc).toHaveBeenCalledWith(cpe);
  });
});

describe('CPEs ToolBarIcons tests', () => {
  test('should render', () => {
    const handleCpeDownload = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons entity={cpe} onCpeDownloadClick={handleCpeDownload} />,
    );

    const links = element.querySelectorAll('a');
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: CPEs',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cpe',
    );

    expect(links[1]).toHaveAttribute('href', '/cpes');
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'CPE List',
    );
  });

  test('should call click handlers', () => {
    const handleCpeDownload = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons entity={cpe} onCpeDownloadClick={handleCpeDownload} />,
    );

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: CPEs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'CPE List',
    );

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleCpeDownload).toHaveBeenCalledWith(cpe);
    expect(exportIcon).toHaveAttribute('title', 'Export CPE');
  });
});
