/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  TlsCertificatesModifiedDisplay,
  TlsCertificatesModifiedTableDisplay,
} from 'web/pages/tlscertificates/dashboard/TlsCertificateModifiedDisplay';

const loaderData = {
  groups: [
    {value: '2026-01-01', count: 5, c_count: 10},
    {value: '2026-01-02', count: 3, c_count: 13},
  ],
};

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        {typeof children === 'function'
          ? children({
              width: 400,
              height: 300,
              data: transformedData,
              state: {showLegend: false},
              setState: testing.fn(),
              svgRef: {current: null},
            })
          : children}
      </div>
    );
  },
}));

vi.mock('web/components/chart/LineChart', () => ({
  default: ({data, xAxisLabel, yAxisLabel, y2AxisLabel}) => (
    <div data-testid="mock-line-chart">
      <span data-testid="x-axis-label">{xAxisLabel}</span>
      <span data-testid="y-axis-label">{yAxisLabel}</span>
      <span data-testid="y2-axis-label">{y2AxisLabel}</span>
      {data.map((row, index) => (
        <span key={index} data-testid={`data-point-${index}`}>
          {row.label}|{row.y}|{row.y2}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('web/components/dashboard/display/DataTableDisplay', () => ({
  default: ({data, dataRow, dataTitles, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-table-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        <span data-testid="data-titles">{dataTitles?.join('|')}</span>
        {transformedData?.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {dataRow(transformedData)?.[index]?.join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=tls_certificate', counts: {}},
    }),
  },
  tlscertificates: {
    getModifiedAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
});

const renderDisplay = (component: ReactElement) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp(), store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('TlsCertificatesModifiedDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TlsCertificatesModifiedDisplay).toBeDefined();
    expect(typeof TlsCertificatesModifiedDisplay).toBe('function');
    expect(TlsCertificatesModifiedDisplay.displayId).toBe(
      'tls-certificates-by-modification-time',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TlsCertificatesModifiedDisplay.displayId);

    expect(registered?.component).toBe(TlsCertificatesModifiedDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: TLS Certificates by Modification Time',
    );
  });

  test('should render the configured chart and transformed data', async () => {
    renderDisplay(<TlsCertificatesModifiedDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'TLS Certificates by Modification Time (Total: 8)',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent(
        '# of Modified TLS Certificates',
      );
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Total TLS Certificates',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent(
        '01/01/2026|5|10',
      );
      expect(screen.getByTestId('data-point-1')).toHaveTextContent(
        '01/02/2026|3|13',
      );
    });
  });
});

describe('TlsCertificatesModifiedTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TlsCertificatesModifiedTableDisplay).toBeDefined();
    expect(typeof TlsCertificatesModifiedTableDisplay).toBe('function');
    expect(TlsCertificatesModifiedTableDisplay.displayId).toBe(
      'tls-certificates-by-modification-time-table',
    );
    expect(TlsCertificatesModifiedTableDisplay.displayName).toBe(
      'TlsCertificatesModifiedTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(
      TlsCertificatesModifiedTableDisplay.displayId,
    );

    expect(registered?.component).toBe(TlsCertificatesModifiedTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: TLS Certificates by Modification Time',
    );
  });

  test('should render the configured table data', async () => {
    renderDisplay(
      <TlsCertificatesModifiedTableDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'TLS Certificates by Modification Time (Total: 8)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Creation Time|# of Modified Certificates|Total Certificates',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        '01/01/2026|5|10',
      );
      expect(screen.getByTestId('data-row-1')).toHaveTextContent(
        '01/02/2026|3|13',
      );
    });
  });
});
