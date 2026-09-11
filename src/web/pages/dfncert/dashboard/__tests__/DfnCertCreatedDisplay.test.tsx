/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  DfnCertsCreatedDisplay,
  DfnCertsCreatedTableDisplay,
} from 'web/pages/dfncert/dashboard/DfnCertCreatedDisplay';

const loaderData = {
  groups: [{value: '2026-01-01', count: '5', c_count: '10'}],
};

vi.mock('web/components/dashboard/display/created/CreatedDisplay', () => ({
  default: ({title, xAxisLabel, yAxisLabel, y2AxisLabel}) => (
    <div data-testid="mock-created-display">
      <span data-testid="title">{title?.()}</span>
      <span data-testid="x-axis-label">{xAxisLabel}</span>
      <span data-testid="y-axis-label">{yAxisLabel}</span>
      <span data-testid="y2-axis-label">{y2AxisLabel}</span>
    </div>
  ),
}));

vi.mock('web/components/dashboard/display/DataTableDisplay', () => ({
  default: ({data, dataRow, dataTitles, dataTransform, title}) => {
    const transformedData = dataTransform ? dataTransform(data) : data;

    return (
      <div data-testid="mock-data-table-display">
        <span data-testid="title">{title?.()}</span>
        <span data-testid="data-titles">{dataTitles?.join('|')}</span>
        {transformedData.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {dataRow(row).join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

const createGmp = () => ({
  dfncerts: {
    getCreatedAggregates: testing.fn().mockResolvedValue({data: loaderData}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=dfn_cert_advisory', counts: {}},
    }),
  },
});

const renderDisplay = (component: ReactElement) => {
  const subscribe: SubscribeFunc = testing.fn().mockReturnValue(testing.fn());
  const {render} = rendererWith({gmp: createGmp()});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {component}
    </SubscriptionContext.Provider>,
  );
};

describe('DfnCertsCreatedDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(DfnCertsCreatedDisplay).toBeDefined();
    expect(typeof DfnCertsCreatedDisplay).toBe('function');
    expect(DfnCertsCreatedDisplay.displayId).toBe('dfn_cert_adv-by-created');
    expect(DfnCertsCreatedDisplay.displayName).toBe('DfnCertsCreatedDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(DfnCertsCreatedDisplay.displayId);

    expect(registered?.component).toBe(DfnCertsCreatedDisplay);
    expect(String(registered?.title)).toBe(
      'Chart: DFN-CERT Advisories by Creation Time',
    );
  });

  test('should render the configured chart labels', async () => {
    renderDisplay(<DfnCertsCreatedDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'DFN-CERT Advisories by Creation Time',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent(
        '# of created DFN-CERT Advs',
      );
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Total DFN-CERT Advs',
      );
    });
  });
});

describe('DfnCertsCreatedTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(DfnCertsCreatedTableDisplay).toBeDefined();
    expect(typeof DfnCertsCreatedTableDisplay).toBe('function');
    expect(DfnCertsCreatedTableDisplay.displayId).toBe(
      'dfn_cert_adv-by-created-table',
    );
    expect(DfnCertsCreatedTableDisplay.displayName).toBe(
      'DfnCertsCreatedTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(DfnCertsCreatedTableDisplay.displayId);

    expect(registered?.component).toBe(DfnCertsCreatedTableDisplay);
    expect(String(registered?.title)).toBe(
      'Table: DFN-CERT Advisories by Creation Time',
    );
  });

  test('should render the configured table data', async () => {
    renderDisplay(<DfnCertsCreatedTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'DFN-CERT Advisories by Creation Time',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Creation Time|# of DFN-CERT Advs|Total DFN-CERT Advs',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        '01/01/2026|5|10',
      );
    });
  });
});
