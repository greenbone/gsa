/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import ReportConfig from 'gmp/models/reportconfig';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import ReportConfigsPage, {
  ToolBarIcons,
} from 'web/pages/reportconfigs/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/scanconfigs';
import {setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {screen, testBulkTrashcanDialog} from 'web/testing';
import {rendererWith, fireEvent, wait} from 'web/utils/Testing';

const config = ReportConfig.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: '1',
  in_use: '0',
  report_format: {
    _id: '54321',
    name: 'baz',
  },
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getReportConfigs = testing.fn().mockResolvedValue({
  data: [config],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getSetting = testing.fn().mockResolvedValue({filter: null});

describe('ReportConfigsPage tests', () => {
  test('should render full ReportConfigsPage', async () => {
    const gmp = {
      reportconfigs: {
        get: getReportConfigs,
      },
      filters: {
        get: getFilters,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, getSetting: getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('reportconfig', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([config], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<ReportConfigsPage />);

    await wait();

    expect(baseElement).toBeVisible();
  });

  test('should call commands for bulk actions', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const addTagByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const renewSession = testing.fn().mockResolvedValue({data: {}});

    const gmp = {
      reportconfigs: {
        get: getReportConfigs,
        deleteByFilter,
        addTagByFilter,
      },
      filters: {
        get: getFilters,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, getSetting, renewSession},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('reportconfig', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([config], filter, loadedFilter, counts),
    );

    render(<ReportConfigsPage />);

    await wait();

    const deleteIcon = screen.getAllByTitle(
      'Move page contents to trashcan',
    )[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });

  describe('ReportConfigsPage ToolBarIcons test', () => {
    test('should render', () => {
      const handleReportConfigCreateClick = testing.fn();

      const gmp = {
        settings: {manualUrl},
      };

      const {render} = rendererWith({
        gmp,
        capabilities: caps,
        router: true,
      });

      const {element} = render(
        <ToolBarIcons
          onReportConfigCreateClick={handleReportConfigCreateClick}
        />,
      );
      expect(element).toBeVisible();

      const links = element.querySelectorAll('a');

      expect(screen.getByTestId('help-icon')).toHaveAttribute(
        'title',
        'Help: Report Configs',
      );
      expect(screen.getByTestId('new-icon')).toHaveAttribute(
        'title',
        'New Report Config',
      );
      expect(links[0]).toHaveAttribute(
        'href',
        'test/en/reports.html#customizing-report-formats-with-report-configurations',
      );
    });

    test('should call click handlers', () => {
      const handleReportConfigCreateClick = testing.fn();

      const gmp = {
        settings: {manualUrl},
      };

      const {render} = rendererWith({
        gmp,
        capabilities: caps,
        router: true,
      });

      render(
        <ToolBarIcons
          onReportConfigCreateClick={handleReportConfigCreateClick}
        />,
      );

      const newIcon = screen.getByTestId('new-icon');
      expect(newIcon).toHaveAttribute('title', 'New Report Config');
      fireEvent.click(newIcon);
      expect(handleReportConfigCreateClick).toHaveBeenCalled();
    });

    test('should not show icons if user does not have the right permissions', () => {
      const handleReportConfigCreateClick = testing.fn();

      const gmp = {settings: {manualUrl}};

      const {render} = rendererWith({
        gmp,
        capabilities: wrongCaps,
        router: true,
      });

      render(
        <ToolBarIcons
          onReportConfigCreateClick={handleReportConfigCreateClick}
        />,
      );

      const newIcon = screen.queryByTestId('new-icon');
      expect(newIcon).toBeNull();
    });
  });
});
