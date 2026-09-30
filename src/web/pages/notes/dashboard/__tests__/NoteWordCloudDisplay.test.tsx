/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {getDisplay} from 'web/components/dashboard/registry';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  NotesWordCloudDisplay,
  NotesWordCloudTableDisplay,
} from 'web/pages/notes/dashboard/NoteWordCloudDisplay';

const loaderData = {
  groups: [
    {value: 'security', count: 5},
    {value: 'network', count: 3},
  ],
};

vi.mock('web/components/dashboard/display/DataDisplay', () => ({
  default: ({children, data, showToggleLegend, title}) => {
    return (
      <div data-testid="mock-data-display">
        <span data-testid="title">{title?.(data)}</span>
        <span data-testid="show-toggle-legend">{String(showToggleLegend)}</span>
        {typeof children === 'function'
          ? children({
              width: 400,
              height: 300,
              data,
              svgRef: {current: null},
            })
          : children}
      </div>
    );
  },
}));

vi.mock('web/components/dashboard/display/DataTableDisplay', () => ({
  default: ({data, dataRow, dataTitles, title}) => {
    const rowData = dataRow(data);
    return (
      <div data-testid="mock-data-table-display">
        <span data-testid="title">{title?.()}</span>
        <span data-testid="data-titles">{dataTitles?.join('|')}</span>
        {rowData.map((row, index) => (
          <span key={index} data-testid={`data-row-${index}`}>
            {row?.join('|')}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock('web/components/chart/WordCloudChart', () => ({
  default: ({data, onDataClick}) => (
    <div data-testid="mock-word-cloud-chart">
      {data.map((row, index) => (
        <button
          key={index}
          data-testid={`data-word-${index}`}
          onClick={() => onDataClick?.(row.filterValue)}
        >
          {row.label}|{row.value}|{row.filterValue}
        </button>
      ))}
    </div>
  ),
}));

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: 'type=note', counts: {}},
    }),
  },
  notes: {
    getWordCountsAggregates: testing.fn().mockResolvedValue({data: loaderData}),
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

describe('NotesWordCloudDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NotesWordCloudDisplay).toBeDefined();
    expect(NotesWordCloudDisplay.displayId).toBe('note-by-text-words');
    expect(NotesWordCloudDisplay.displayName).toBe('NotesWordCloudDisplay');
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NotesWordCloudDisplay.displayId);

    expect(registered?.component).toBe(NotesWordCloudDisplay);
    expect(String(registered?.title)).toBe('Chart: Notes Text Word Cloud');
  });

  test('should render the loaded words', async () => {
    renderDisplay(<NotesWordCloudDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Notes Text Word Cloud',
      );
      expect(screen.getByTestId('data-word-0')).toHaveTextContent(
        'security|5|security',
      );
      expect(screen.getByTestId('data-word-1')).toHaveTextContent(
        'network|3|network',
      );
    });
  });

  test('should set showToggleLegend to false', async () => {
    renderDisplay(<NotesWordCloudDisplay height={200} width={200} />);

    expect(await screen.findByTestId('show-toggle-legend')).toHaveTextContent(
      'false',
    );
  });

  test('should call onFilterChanged with a text filter when clicking a word', async () => {
    const onFilterChanged = testing.fn();

    renderDisplay(
      <NotesWordCloudDisplay
        height={200}
        width={200}
        onFilterChanged={onFilterChanged}
      />,
    );

    const wordButton = await screen.findByRole('button', {
      name: /security\|5\|security/,
    });
    fireEvent.click(wordButton);

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'text~"security"',
    );
  });

  test('should not throw when clicking a word without onFilterChanged', async () => {
    renderDisplay(<NotesWordCloudDisplay height={200} width={200} />);

    const wordButton = await screen.findByRole('button', {
      name: /security\|5\|security/,
    });
    expect(() => fireEvent.click(wordButton)).not.toThrow();
  });
});

describe('NotesWordCloudTableDisplay', () => {
  test('should export a valid component with the correct configuration', () => {
    expect(NotesWordCloudTableDisplay).toBeDefined();
    expect(NotesWordCloudTableDisplay.displayId).toBe(
      'note-by-text-words-table',
    );
    expect(NotesWordCloudTableDisplay.displayName).toBe(
      'NotesWordCloudTableDisplay',
    );
  });

  test('should be registered with the correct title', () => {
    const registered = getDisplay(NotesWordCloudTableDisplay.displayId);

    expect(registered?.component).toBe(NotesWordCloudTableDisplay);
    expect(String(registered?.title)).toBe('Table: Notes Text Word Cloud');
  });

  test('should render the configured table data', async () => {
    renderDisplay(<NotesWordCloudTableDisplay height={200} width={200} />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Notes Text Word Cloud',
      );
      expect(screen.getByTestId('data-titles')).toHaveTextContent('Text|Count');
      expect(screen.getByTestId('data-row-0')).toHaveTextContent('security|5');
      expect(screen.getByTestId('data-row-1')).toHaveTextContent('network|3');
    });
  });
});
