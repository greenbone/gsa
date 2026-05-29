/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockDeltaReport} from 'web/pages/reports/__fixtures__/MockDeltaReport';
import DeltaDetailsContent from 'web/pages/reports/DeltaDetailsContent';

const filter = Filter.fromString(
  'apply_overrides=0 levels=chml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const filterWithName = Filter.fromElement({
  term: 'apply_overrides=0 levels=chml rows=2 min_qod=70 first=1 sort-reverse=severity',
  name: 'foo',
  id: '123',
});

const manualUrl = 'test/';

const {entity: mockEntity} = getMockDeltaReport();

const createGmp = ({
  reportResultsThreshold = 10,
  severityRating = undefined,
} = {}) => ({
  settings: {
    manualUrl,
    reportResultsThreshold,
    severityRating,
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
      ],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2, first: 1, rows: 10}),
      },
    }),
  },
});

describe('DeltaReportDetailsContent tests', () => {
  test('should render Delta Report Details Content', () => {
    const {entity} = getMockDeltaReport();
    const filters = [filterWithName];
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <DeltaDetailsContent
        entity={entity}
        filter={filterWithName}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        reportId={entity.report.id}
        showError={testing.fn()}
        showErrorMessage={testing.fn()}
        showSuccessMessage={testing.fn()}
        sortField="severity"
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
    const helpIcon = screen.getByTitle('Help: Reading Reports');
    expect(helpIcon.closest('a')).toHaveAttribute(
      'href',
      'test/en/reports.html#reading-a-report',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/reports',
    );
    expect(screen.getByTitle(/^Add to Assets/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Remove from Assets/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Download filtered Report/)).toBeInTheDocument();

    // Powerfilter
    const powerFilter = within(screen.queryPowerFilter());
    const select = powerFilter.getByTestId('powerfilter-select');
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('foo');

    // Header
    expect(
      screen.getByRole('heading', {name: /Report: Mon/}),
    ).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /^ID:/})).toHaveTextContent(
      '91011',
    );
    expect(entityInfo.getByRole('row', {name: /^Created:/})).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
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

    // Summary tab (Information) is active by default
    const taskName = screen.getByRole('row', {name: /^Task Name/});
    expect(taskName).toHaveTextContent('foo');
    expect(within(taskName).getByRole('link')).toHaveAttribute(
      'href',
      '/task/314',
    );
    expect(screen.getByRole('row', {name: /^Comment/})).toHaveTextContent(
      'bar',
    );

    const reportRow1 = screen.getByRole('row', {name: /^Report 1/});
    expect(reportRow1).toHaveTextContent('11234');
    expect(within(reportRow1).getByRole('link')).toHaveAttribute(
      'href',
      '/report/1234',
    );
    expect(
      screen.getByRole('row', {name: /^Scan Time Report 1/}),
    ).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time - Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );
    expect(
      screen.getByRole('row', {name: /^Scan Duration Report 1/}),
    ).toHaveTextContent('0:31 h');
    expect(
      screen.getByRole('row', {name: /^Scan Status Report 1/}),
    ).toHaveTextContent('Done');

    const reportRow2 = screen.getByRole('row', {name: /^Report 2/});
    expect(reportRow2).toHaveTextContent('5678');
    expect(within(reportRow2).getByRole('link')).toHaveAttribute(
      'href',
      '/report/5678',
    );

    expect(screen.getByRole('row', {name: /^Filter/})).toHaveTextContent(
      'apply_overrides=0 levels=chml min_qod=70',
    );
    expect(screen.getByRole('row', {name: /^Timezone/})).toHaveTextContent(
      'UTC (UTC)',
    );
  });

  test('should render results tab', () => {
    const {entity} = getMockDeltaReport();
    const filters = [filterWithName];
    const gmp = createGmp({severityRating: SEVERITY_RATING_CVSS_3});
    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <DeltaDetailsContent
        entity={entity}
        filter={filter}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        reportId={entity.report.id}
        showError={testing.fn()}
        showErrorMessage={testing.fn()}
        showSuccessMessage={testing.fn()}
        sortField="severity"
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
