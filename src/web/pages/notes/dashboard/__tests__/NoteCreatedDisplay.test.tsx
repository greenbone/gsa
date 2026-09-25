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
  NotesCreatedDisplay,
  NotesCreatedTableDisplay,
} from 'web/pages/notes/dashboard/NoteCreatedDisplay';

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
      meta: {filter: 'type=note', counts: {}},
    }),
  },
  notes: {
    getCreatedAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('NotesCreatedDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NotesCreatedDisplay).toBeDefined();
    expect(typeof NotesCreatedDisplay).toBe('function');
    expect(NotesCreatedDisplay.displayId).toBe('note-by-created');
    expect(NotesCreatedDisplay.displayName).toBe('NotesCreatedDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NotesCreatedDisplay.displayId);

    expect(registered?.component).toBe(NotesCreatedDisplay);
    expect(String(registered?.title)).toBe('Chart: Notes by Creation Time');
  });

  test('should render the configured chart labels', async () => {
    renderDisplay(<NotesCreatedDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Notes by Creation Time',
      );
      expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Time');
      expect(screen.getByTestId('y-axis-label')).toHaveTextContent(
        '# of Created Notes',
      );
      expect(screen.getByTestId('y2-axis-label')).toHaveTextContent(
        'Total Notes',
      );
    });
  });
});

describe('NotesCreatedTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NotesCreatedTableDisplay).toBeDefined();
    expect(typeof NotesCreatedTableDisplay).toBe('function');
    expect(NotesCreatedTableDisplay.displayId).toBe('note-by-created-table');
    expect(NotesCreatedTableDisplay.displayName).toBe(
      'NotesCreatedTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NotesCreatedTableDisplay.displayId);

    expect(registered?.component).toBe(NotesCreatedTableDisplay);
    expect(String(registered?.title)).toBe('Table: Notes by Creation Time');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<NotesCreatedTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Notes by Creation Time',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent(
        'Creation Time|# of Notes|Total Notes',
      );
      expect(screen.getByTestId('data-row-0')).toHaveTextContent(
        '01/01/2026|5|10',
      );
    });
  });
});
