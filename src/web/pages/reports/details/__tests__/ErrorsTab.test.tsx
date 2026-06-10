/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import ErrorsTab from 'web/pages/reports/details/error/ErrorsTab';

const filter = Filter.fromString('first=1 rows=10');

const {errors: mockReportErrors} = getMockReport();
const mockErrors = mockReportErrors?.entities ?? [];
const mockErrorsCounts =
  mockReportErrors?.counts ??
  new CollectionCounts({filtered: 0, all: 0, first: 1, rows: 10});

const reportId = 'report-123';

const mockErrorsData = {
  entities: mockErrors,
  entitiesCounts: mockErrorsCounts,
};

describe('ErrorsTab', () => {
  test('should render loading state initially', () => {
    const gmp = {};
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ErrorsTab filter={filter} isErrorsFetching={true} reportId={reportId} />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render table with errors', async () => {
    const gmp = {};
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ErrorsTab
        errorsData={mockErrorsData}
        filter={filter}
        reportId={reportId}
      />,
    );

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const header = within(table).getAllByRole('columnheader');
    expect(header[0]).toHaveTextContent('Error Message');
    expect(header[1]).toHaveTextContent('Host');
    expect(header[2]).toHaveTextContent('Hostname');
    expect(header[3]).toHaveTextContent('NVT');
    expect(header[4]).toHaveTextContent('Port');

    expect(table).toHaveTextContent('This is another error.');
    expect(table).toHaveTextContent('109.876.54.321');
    expect(table).toHaveTextContent('NVT2');
    expect(table).toHaveTextContent('456/tcp');

    expect(table).toHaveTextContent('This is an error.');
    expect(table).toHaveTextContent('123.456.78.910');
    expect(table).toHaveTextContent('NVT1');
    expect(table).toHaveTextContent('123/tcp');
  });

  test('should render empty state when no errors', async () => {
    const gmp = {};
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ErrorsTab
        errorsData={{
          entities: [],
          entitiesCounts: new CollectionCounts({
            filtered: 0,
            all: 0,
            first: 1,
            rows: 10,
          }),
        }}
        filter={filter}
        reportId={reportId}
      />,
    );

    expect(await screen.findByText('No Errors available')).toBeInTheDocument();
  });

  test('should render error panel when errors are in error state', async () => {
    const gmp = {};
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ErrorsTab filter={filter} isErrorsError={true} reportId={reportId} />,
    );

    expect(
      await screen.findByText(/Error while loading Error Messages for Report/),
    ).toBeInTheDocument();
  });

  test('should show applied filter', async () => {
    const gmp = {};
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ErrorsTab
        errorsData={mockErrorsData}
        filter={filter}
        reportId={reportId}
      />,
    );

    await screen.findByRole('table');

    expect(screen.getByText(/Applied filter:/)).toBeInTheDocument();
  });
});
