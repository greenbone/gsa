/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor, fireEvent} from 'web/testing';
import {vi} from 'vitest';
import {type FilterType} from 'gmp/models/filter';
import DashboardView, {
  DEFAULT_MAX_ITEMS_PER_ROW,
  DEFAULT_MAX_ROWS,
} from 'web/components/dashboard/DashboardView';
import {
  type DisplayComponent,
  registerDisplay,
} from 'web/components/dashboard/registry';

vi.mock('web/components/sortable/SortableGrid', () => ({
  default: (props: unknown) => {
    const globals = globalThis as typeof globalThis & {
      __dashboardSortableGridCalls?: unknown[];
    };
    globals.__dashboardSortableGridCalls ??= [];
    globals.__dashboardSortableGridCalls.push(props);
    return null;
  },
}));

const createDisplayComponent = (displayId: string): DisplayComponent =>
  Object.assign(() => null, {displayId});

let testCounter = 0;

const createDashboardState = () => {
  testCounter += 1;
  const dashboardId = `dashboard-view-${testCounter}`;
  const ignoredDisplayId = `ignored-view-${testCounter}`;
  const defaultDisplayId = `default-view-${testCounter}`;
  const validDisplayId = `valid-view-${testCounter}`;

  registerDisplay(createDisplayComponent(validDisplayId), 'Valid display');
  registerDisplay(createDisplayComponent(defaultDisplayId), 'Default display');

  const settings = {
    maxItemsPerRow: 2,
    maxRows: 3,
    rows: [
      {
        id: `row-view-${testCounter}`,
        items: [
          {id: `item-view-${testCounter}`, displayId: validDisplayId},
          {id: `ignored-view-${testCounter}`, displayId: ignoredDisplayId},
        ],
      },
    ],
  };

  const defaultDisplays = [[defaultDisplayId]];
  const permittedDisplays = [
    validDisplayId,
    ignoredDisplayId,
    defaultDisplayId,
  ];
  const loadSettings = testing.fn();
  const saveSettings = testing.fn();
  const setDefaultSettings = testing.fn();

  return {
    dashboardId,
    defaultDisplayId,
    defaultDisplays,
    loadSettings,
    permittedDisplays,
    saveSettings,
    setDefaultSettings,
    settings,
  };
};

describe('DashboardView', () => {
  beforeEach(() => {
    testing.clearAllMocks();
    const globals = globalThis as typeof globalThis & {
      __dashboardSortableGridCalls?: unknown[];
    };
    globals.__dashboardSortableGridCalls = [];
  });

  test('should load defaults and pass filtered rows to SortableGrid', async () => {
    const {
      dashboardId,
      defaultDisplayId,
      defaultDisplays,
      loadSettings,
      permittedDisplays,
      saveSettings,
      setDefaultSettings,
      settings,
    } = createDashboardState();
    const {render} = rendererWith({store: true});

    render(
      <DashboardView
        defaultDisplays={defaultDisplays}
        id={dashboardId}
        isLoading={false}
        loadSettings={loadSettings}
        permittedDisplays={permittedDisplays}
        saveSettings={saveSettings}
        setDefaultSettings={setDefaultSettings}
        settings={settings}
      />,
    );

    await waitFor(() => expect(loadSettings).toHaveBeenCalledTimes(1));
    expect(setDefaultSettings).toHaveBeenCalledWith(
      dashboardId,
      expect.objectContaining({rows: expect.any(Array)}),
    );
    expect(setDefaultSettings.mock.calls[0][1].rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({displayId: defaultDisplayId}),
          ]),
        }),
      ]),
    );

    const globals = globalThis as typeof globalThis & {
      __dashboardSortableGridCalls?: unknown[];
    };
    const lastCall = globals.__dashboardSortableGridCalls?.at(-1) as {
      items: Array<{id: string; items: string[]}>;
      maxItemsPerRow: number;
      maxRows: number;
    };
    expect(lastCall.items).toEqual([
      expect.objectContaining({
        id: `row-view-${testCounter}`,
        items: [`item-view-${testCounter}`],
      }),
    ]);
    expect(lastCall.maxItemsPerRow).toBe(DEFAULT_MAX_ITEMS_PER_ROW);
    expect(lastCall.maxRows).toBe(DEFAULT_MAX_ROWS);
  });

  test('should forward display props to the registered display component', async () => {
    const {
      dashboardId,
      defaultDisplays,
      loadSettings,
      permittedDisplays,
      saveSettings,
      setDefaultSettings,
      settings,
    } = createDashboardState();
    const filter = {} as FilterType;
    const notify = testing.fn();
    const onFilterChanged = testing.fn();
    const {render} = rendererWith({store: true});

    render(
      <DashboardView
        showFilterSelection
        showFilterString
        defaultDisplays={defaultDisplays}
        filter={filter}
        id={dashboardId}
        isLoading={false}
        loadSettings={loadSettings}
        notify={notify}
        permittedDisplays={permittedDisplays}
        saveSettings={saveSettings}
        setDefaultSettings={setDefaultSettings}
        settings={settings}
        onFilterChanged={onFilterChanged}
      />,
    );

    await waitFor(() => expect(loadSettings).toHaveBeenCalledTimes(1));

    const lastCall = globalThis.__dashboardSortableGridCalls?.at(-1) as {
      children: (props: {
        dragHandleRef: () => void;
        height: number;
        id: string;
        width: number;
      }) => React.ReactElement;
    };
    const dragHandleRef = testing.fn();
    const display = lastCall.children({
      dragHandleRef,
      height: 100,
      id: `item-view-${testCounter}`,
      width: 200,
    });
    const displayProps = display.props as Record<string, unknown>;

    expect(displayProps).toEqual(
      expect.objectContaining({
        dragHandleRef,
        filter,
        height: 100,
        id: `item-view-${testCounter}`,
        notify,
        onFilterChanged,
        showFilterSelection: true,
        showFilterString: true,
        width: 200,
      }),
    );
    expect(displayProps.onFilterIdChanged).toEqual(expect.any(Function));
    expect(displayProps.onRemoveClick).toEqual(expect.any(Function));
    expect(displayProps.setState).toEqual(expect.any(Function));
  });

  test('should render a loading indicator', () => {
    const {
      dashboardId,
      defaultDisplays,
      loadSettings,
      permittedDisplays,
      saveSettings,
      setDefaultSettings,
    } = createDashboardState();
    const {render} = rendererWith({store: true});

    render(
      <DashboardView
        isLoading
        defaultDisplays={defaultDisplays}
        id={dashboardId}
        loadSettings={loadSettings}
        permittedDisplays={permittedDisplays}
        saveSettings={saveSettings}
        setDefaultSettings={setDefaultSettings}
      />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(globalThis.__dashboardSortableGridCalls).toEqual([]);
  });

  test('should render a loading indicator before settings load starts', () => {
    const {
      dashboardId,
      defaultDisplays,
      loadSettings,
      permittedDisplays,
      saveSettings,
      setDefaultSettings,
    } = createDashboardState();
    const {render} = rendererWith({store: true});

    render(
      <DashboardView
        defaultDisplays={defaultDisplays}
        id={dashboardId}
        isLoading={false}
        loadSettings={loadSettings}
        permittedDisplays={permittedDisplays}
        saveSettings={saveSettings}
        setDefaultSettings={setDefaultSettings}
      />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(globalThis.__dashboardSortableGridCalls).toEqual([]);
  });

  test('should not reload when display props keep the same content', async () => {
    const {
      dashboardId,
      defaultDisplays,
      loadSettings,
      permittedDisplays,
      saveSettings,
      setDefaultSettings,
    } = createDashboardState();
    const {render} = rendererWith({store: true});

    const TestComponent = () => {
      const [rerendered, setRerendered] = useState(false);
      return (
        <>
          <button
            data-testid="rerender-dashboard-view"
            onClick={() => setRerendered(true)}
          />
          <DashboardView
            defaultDisplays={
              rerendered
                ? [...defaultDisplays.map(row => [...row])]
                : defaultDisplays
            }
            id={dashboardId}
            isLoading={false}
            loadSettings={loadSettings}
            permittedDisplays={
              rerendered ? [...permittedDisplays] : permittedDisplays
            }
            saveSettings={saveSettings}
            setDefaultSettings={setDefaultSettings}
          />
        </>
      );
    };

    render(<TestComponent />);
    await waitFor(() => expect(loadSettings).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId('rerender-dashboard-view'));
    await waitFor(() => expect(loadSettings).toHaveBeenCalledTimes(1));
  });

  test('should reload when display props content changes', async () => {
    const {
      dashboardId,
      defaultDisplayId,
      defaultDisplays,
      loadSettings,
      permittedDisplays,
      saveSettings,
      setDefaultSettings,
    } = createDashboardState();
    const extraDisplayId = `extra-view-${testCounter}`;
    registerDisplay(createDisplayComponent(extraDisplayId), 'Extra display');
    const {render} = rendererWith({store: true});

    const TestComponent = () => {
      const [rerendered, setRerendered] = useState(false);
      return (
        <>
          <button
            data-testid="rerender-dashboard-view-with-changes"
            onClick={() => setRerendered(true)}
          />
          <DashboardView
            defaultDisplays={
              rerendered
                ? [[defaultDisplayId, extraDisplayId]]
                : defaultDisplays
            }
            id={dashboardId}
            isLoading={false}
            loadSettings={loadSettings}
            permittedDisplays={
              rerendered
                ? [...permittedDisplays, extraDisplayId]
                : permittedDisplays
            }
            saveSettings={saveSettings}
            setDefaultSettings={setDefaultSettings}
          />
        </>
      );
    };

    render(<TestComponent />);
    await waitFor(() => expect(loadSettings).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId('rerender-dashboard-view-with-changes'));
    await waitFor(() => expect(loadSettings).toHaveBeenCalledTimes(2));
  });
});
