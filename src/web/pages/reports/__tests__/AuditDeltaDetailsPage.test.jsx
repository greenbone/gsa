/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {getMockAuditDeltaReport} from 'web/pages/reports/__fixtures__/MockAuditDeltaReport';
import DeltaDetailsContent from 'web/pages/reports/DeltaDetailsContent';

const filter = Filter.fromString(
  'apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant',
);

const filterWithName = Filter.fromElement({
  term: 'apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant',
  name: 'foo',
  id: '123',
});

const manualUrl = 'test/';

const {entity: mockEntity} = getMockAuditDeltaReport();

const createGmp = ({reportResultsThreshold = 10} = {}) => ({
  settings: {
    manualUrl,
    reportResultsThreshold,
  },
  session: createSession({
    timezone: 'CET',
    token: 'test-token',
    username: 'admin',
  }),
  user: {
    currentSettings: testing.fn().mockResolvedValue({foo: 'bar'}),
    getReportComposerDefaults: testing.fn().mockResolvedValue({foo: 'bar'}),
  },
  results: {
    get: testing.fn().mockResolvedValue({
      data: mockEntity.report?.results?.entities ?? [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({
          filtered: 2,
          all: 2,
          first: 1,
          rows: 10,
          length: 2,
        }),
      },
    }),
  },
  reporthosts: {
    get: testing.fn().mockResolvedValue({
      data: [
        {ip: '123.456.78.910', id: '123.456.78.910', hostname: 'foo.bar'},
        {ip: '109.876.54.321', id: '109.876.54.321', hostname: 'lorem.ipsum'},
        {ip: '109.876.54.322', id: '109.876.54.322', hostname: 'host3'},
      ],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 3, all: 3, first: 1, rows: 10}),
      },
    }),
  },
});

describe('AuditDeltaDetailsContent tests', () => {
  test('should render Audit Delta Report Details Content', () => {
    const {entity} = getMockAuditDeltaReport();
    const filters = [filterWithName];
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <DeltaDetailsContent
        audit={true}
        entity={entity}
        filter={filterWithName}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        reportId={entity.report.id}
        showError={testing.fn()}
        showErrorMessage={testing.fn()}
        showSuccessMessage={testing.fn()}
        sortField="compliant"
        sortReverse={true}
        task={entity.report.task}
        onAddToAssetsClick={testing.fn()}
        onError={testing.fn()}
        onFilterAddLogLevelClick={testing.fn()}
        onFilterChanged={testing.fn()}
        onFilterCreated={testing.fn()}
        onFilterDecreaseMinQoDClick={testing.fn()}
        onFilterEditClick={testing.fn()}
        onFilterRemoveClick={testing.fn()}
        onFilterRemoveSeverityClick={testing.fn()}
        onFilterResetClick={testing.fn()}
        onRemoveFromAssetsClick={testing.fn()}
        onReportDownloadClick={testing.fn()}
        onSortChange={testing.fn()}
        onTagSuccess={testing.fn()}
        onTargetEditClick={testing.fn()}
      />,
    );

    // Toolbar icons
    const helpIcon = screen.getByTitle('Help: Audit Reports');
    expect(helpIcon.closest('a')).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#using-and-managing-audit-reports',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/auditreports',
    );
    expect(screen.getByTitle(/^Add to Assets/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Remove from Assets/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Download filtered Report/)).toBeInTheDocument();

    // Powerfilter
    const powerFilter = within(screen.queryPowerFilter());
    const select = powerFilter.getByTitle('Loaded filter');
    expect(select).toHaveValue('foo');

    // Header
    expect(
      screen.getByRole('heading', {name: /Report: Mon/}),
    ).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer TimeDone',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /^ID:/})).toHaveTextContent(
      '1234',
    );
    expect(entityInfo.getByRole('row', {name: /^Created:/})).toHaveTextContent(
      'Sun, Jun 2, 2019 2:00 PM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /^Modified:/})).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /^Owner:/})).toHaveTextContent(
      'admin',
    );

    // Tabs
    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^results/i})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();

    // Summary
    const taskName = screen.getByRole('row', {name: /^Task Name/});
    expect(taskName).toHaveTextContent('foo');
    expect(within(taskName).getByRole('link')).toHaveAttribute(
      'href',
      '/audit/314',
    );
    expect(screen.getByRole('row', {name: /^Comment/})).toHaveTextContent(
      'bar',
    );

    const reportRow1 = screen.getByRole('row', {name: /^Report 1/});
    expect(reportRow1).toHaveTextContent('1234');
    expect(within(reportRow1).getByRole('link')).toHaveAttribute(
      'href',
      '/audit-report/1234',
    );

    expect(screen.getByRole('row', {name: /^Filter/})).toHaveTextContent(
      'apply_overrides=0 compliance_levels=ynui min_qod=70',
    );
    expect(screen.getByRole('row', {name: /^Timezone/})).toHaveTextContent(
      'UTC (UTC)',
    );
  });

  test('should render results tab', () => {
    const {entity} = getMockAuditDeltaReport();
    const filters = [filterWithName];
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <DeltaDetailsContent
        audit={true}
        entity={entity}
        filter={filter}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        reportId={entity.report.id}
        showError={testing.fn()}
        showErrorMessage={testing.fn()}
        showSuccessMessage={testing.fn()}
        sortField="compliant"
        sortReverse={true}
        task={entity.report.task}
        onAddToAssetsClick={testing.fn()}
        onError={testing.fn()}
        onFilterAddLogLevelClick={testing.fn()}
        onFilterChanged={testing.fn()}
        onFilterCreated={testing.fn()}
        onFilterDecreaseMinQoDClick={testing.fn()}
        onFilterEditClick={testing.fn()}
        onFilterRemoveClick={testing.fn()}
        onFilterRemoveSeverityClick={testing.fn()}
        onFilterResetClick={testing.fn()}
        onRemoveFromAssetsClick={testing.fn()}
        onReportDownloadClick={testing.fn()}
        onSortChange={testing.fn()}
        onTagSuccess={testing.fn()}
        onTargetEditClick={testing.fn()}
      />,
    );

    const resultsTab = screen.getByRole('tab', {name: /Results/});
    fireEvent.click(resultsTab);

    // Summary content should not be visible after switching tabs
    expect(
      screen.queryByRole('row', {name: /^Task Name/}),
    ).not.toBeInTheDocument();
  });
});
