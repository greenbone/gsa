/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  screen,
  testBulkTrashcanDialog,
  within,
  rendererWith,
  fireEvent,
  wait,
} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collection-counts';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import AuditPage, {ToolBarIcons} from 'web/pages/audits/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/audits';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-10T12:51:27Z',
    compliance_count: {yes: 4, no: 3, incomplete: 1},
  },
};

const audit = Audit.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  status: AUDIT_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id1', name: 'target1'},
});

const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = 1;
const manualUrl = 'test/';

const createGmp = ({
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse),
  deleteByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  getSetting = testing.fn().mockResolvedValue({
    filter: null,
  }),
  getFilters = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getAudits = testing.fn().mockResolvedValue({
    data: [audit],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getReportFormats = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
} = {}) => ({
  audits: {
    get: getAudits,
    deleteByFilter,
    exportByFilter,
  },
  filters: {
    get: getFilters,
  },
  reportformats: {
    get: getReportFormats,
  },
  reloadInterval,
  settings: {
    manualUrl,
  },
  session: createSession({timezone: 'CET'}),
  user: {currentSettings, getSetting},
});

describe('AuditPage tests', () => {
  test('should render full AuditPage', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('audit', defaultSettingFilter),
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
      entitiesLoadingActions.success([audit], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<AuditPage />);

    await wait();

    expect(baseElement).toBeVisible();
    const tableBody = screen.queryTableBody();
    expect(tableBody.querySelectorAll('tr').length).toEqual(1);
  });

  test('should call commands for bulk actions', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('audit', defaultSettingFilter),
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
      entitiesLoadingActions.success([audit], filter, loadedFilter, counts),
    );

    render(<AuditPage />);

    await wait();

    const tableFooter = within(screen.queryTableFooter());
    const deleteIcon = tableFooter.getByTestId('trash-icon');
    expect(gmp.audits.deleteByFilter).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Move page contents to trashcan',
    );
    fireEvent.click(deleteIcon);

    testBulkTrashcanDialog(screen, gmp.audits.deleteByFilter);

    const exportIcon = tableFooter.getByTestId('export-icon');
    expect(gmp.audits.exportByFilter).not.toHaveBeenCalled();
    expect(exportIcon).toHaveAttribute('title', 'Export page contents');
    fireEvent.click(exportIcon);
    expect(gmp.audits.exportByFilter).toHaveBeenCalled();
  });
});

describe('AuditPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleAuditCreateClick = testing.fn();

    const gmp = createGmp();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons onAuditCreateClick={handleAuditCreateClick} />,
    );
    expect(element).toBeVisible();

    const links = element.querySelectorAll('a');

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Audits',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );
  });

  test('should call click handlers', () => {
    const handleAuditCreateClick = testing.fn();

    const gmp = createGmp();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<ToolBarIcons onAuditCreateClick={handleAuditCreateClick} />);

    const newIcon = screen.getByTestId('new-icon');
    fireEvent.click(newIcon);
    expect(handleAuditCreateClick).toHaveBeenCalled();
    expect(newIcon).toHaveAttribute('title', 'New Audit');
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleAuditCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    render(<ToolBarIcons onAuditCreateClick={handleAuditCreateClick} />);

    expect(screen.queryByTestId('new-icon')).toBeNull();
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Audits',
    );
  });
});
