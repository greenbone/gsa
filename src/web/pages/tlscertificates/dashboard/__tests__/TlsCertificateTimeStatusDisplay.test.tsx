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
  TlsCertificateTimeStatusDisplay,
  TlsCertificateTimeStatusTableDisplay,
} from 'web/pages/tlscertificates/dashboard/TlsCertificateTimeStatusDisplay';

const loaderData = [
  {timeStatus: 'expired'},
  {timeStatus: 'expired'},
  {timeStatus: 'valid'},
  {timeStatus: 'unknown'},
  {timeStatus: 'unknown'},
  {timeStatus: 'unknown'},
  {},
];

vi.mock('web/components/dashboard/display/status/StatusDisplay', () => ({
  default: ({data, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-status-display">
        <span data-testid="title">{title?.({data: transformedData})}</span>
        {transformedData?.map((row, index) => (
          <span key={index} data-testid={`data-point-${index}`}>
            {row.label}|{row.value}|{row.filterValue}
          </span>
        ))}
      </div>
    );
  },
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
    getAll: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('TlsCertificateTimeStatusDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TlsCertificateTimeStatusDisplay).toBeDefined();
    expect(typeof TlsCertificateTimeStatusDisplay).toBe('function');
    expect(TlsCertificateTimeStatusDisplay.displayId).toBe(
      'tls-certificates-by-status',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(TlsCertificateTimeStatusDisplay.displayId);

    expect(registered?.component).toBe(TlsCertificateTimeStatusDisplay);
    expect(String(registered?.title)).toBe('Chart: TLS Certificates by Status');
  });

  test('should render the loaded time statuses', async () => {
    renderDisplay(<TlsCertificateTimeStatusDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'TLS Certificates by Status (Total: 7)',
      );
      expect(screen.getByTestId('data-point-0')).toHaveTextContent(
        'Expired|2|expired',
      );
      expect(screen.getByTestId('data-point-1')).toHaveTextContent(
        'Valid|1|valid',
      );
      expect(screen.getByTestId('data-point-2')).toHaveTextContent(
        'Unknown|3|unknown',
      );
    });
  });
});

describe('TlsCertificateTimeStatusTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(TlsCertificateTimeStatusTableDisplay).toBeDefined();
    expect(typeof TlsCertificateTimeStatusTableDisplay).toBe('function');
    expect(TlsCertificateTimeStatusTableDisplay.displayId).toBe(
      'tls-certificates-by-status-table',
    );
    expect(TlsCertificateTimeStatusTableDisplay.displayName).toBe(
      'TlsCertificateTimeStatusTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(
      TlsCertificateTimeStatusTableDisplay.displayId,
    );

    expect(registered?.component).toBe(TlsCertificateTimeStatusTableDisplay);
    expect(String(registered?.title)).toBe('Table: TLS Certificates by Status');
  });

  test('should render the configured table data', async () => {
    renderDisplay(
      <TlsCertificateTimeStatusTableDisplay height={200} width={200} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'TLS Certificates by Status (Total: 7)',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Status|# of Certificates',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('Expired|2');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('Valid|1');
      expect(screen.getByTestId('data-row-2')).toHaveTextContent('Unknown|3');
    });
  });
});
