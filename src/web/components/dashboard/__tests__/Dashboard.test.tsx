/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {vi} from 'vitest';
import Dashboard, {
  DEFAULT_MAX_ITEMS_PER_ROW,
  DEFAULT_MAX_ROWS,
} from 'web/components/dashboard/Dashboard';
import {
  type DisplayComponent,
  registerDisplay,
} from 'web/components/dashboard/registry';
import {
  loadDashboardSettingsRequest,
  loadDashboardSettingsSuccess,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';

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

  const dashboardId = `dashboard-${testCounter}`;
  const ignoredDisplayId = `ignored-${testCounter}`;
  const defaultDisplayId = `default-${testCounter}`;

  const validDisplayId = `valid-${testCounter}`;

  registerDisplay(createDisplayComponent(validDisplayId), 'Valid display');
  registerDisplay(createDisplayComponent(defaultDisplayId), 'Default display');

  const settings = {
    maxItemsPerRow: 2,
    maxRows: 3,
    rows: [
      {
        id: `row-${testCounter}`,
        items: [
          {id: `item-${testCounter}`, displayId: validDisplayId},
          {id: `ignored-${testCounter}`, displayId: ignoredDisplayId},
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

  const gmp = {
    dashboard: {
      getSetting: testing.fn(() => Promise.resolve({data: settings})),
      saveSetting: testing.fn(() => Promise.resolve({})),
    },
  };

  return {
    dashboardId,
    defaultDisplayId,
    defaultDisplays,
    gmp,
    permittedDisplays,
    settings,
  };
};

describe('Dashboard', () => {
  beforeEach(() => {
    testing.clearAllMocks();
    const globals = globalThis as typeof globalThis & {
      __dashboardSortableGridCalls?: unknown[];
    };

    globals.__dashboardSortableGridCalls = [];
  });

  test('should load default settings on mount and pass filtered rows to SortableGrid', async () => {
    const {
      dashboardId,
      defaultDisplayId,
      defaultDisplays,
      gmp,
      permittedDisplays,
      settings,
    } = createDashboardState();

    const {render, store} = rendererWith({gmp, store: true});

    store.dispatch(loadDashboardSettingsSuccess(dashboardId, settings, {}));

    render(
      <Dashboard
        defaultDisplays={defaultDisplays}
        id={dashboardId}
        permittedDisplays={permittedDisplays}
      />,
    );

    await waitFor(() => {
      expect(gmp.dashboard.getSetting).toHaveBeenCalledWith(dashboardId);
    });

    expect(
      store.getState().dashboardSettings.defaults[dashboardId].rows,
    ).toEqual(
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

    const lastSortableGridCall = globals.__dashboardSortableGridCalls?.at(
      -1,
    ) as {
      items: Array<{id: string; items: string[]}>;
      maxItemsPerRow: number;
      maxRows: number;
    };

    expect(lastSortableGridCall.items).toEqual([
      expect.objectContaining({
        id: `row-${testCounter}`,
        items: ['item-1'],
      }),
    ]);
    expect(lastSortableGridCall.maxItemsPerRow).toBe(DEFAULT_MAX_ITEMS_PER_ROW);
    expect(lastSortableGridCall.maxRows).toBe(DEFAULT_MAX_ROWS);
  });

  test('should render a loading indicator when dashboard settings are loading', () => {
    const {dashboardId, defaultDisplays, gmp, permittedDisplays} =
      createDashboardState();

    const {render, store} = rendererWith({gmp, store: true});

    store.dispatch(loadDashboardSettingsRequest(dashboardId));
    store.dispatch(setDashboardSettingDefaults(dashboardId, {}));

    render(
      <Dashboard
        defaultDisplays={defaultDisplays}
        id={dashboardId}
        permittedDisplays={permittedDisplays}
      />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    const globals = globalThis as typeof globalThis & {
      __dashboardSortableGridCalls?: unknown[];
    };

    expect(globals.__dashboardSortableGridCalls).toEqual([]);
  });
});
