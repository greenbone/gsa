/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import DashboardControlsContainer from 'web/components/dashboard/DashboardControlsContainer';
import {
  type DisplayComponent,
  type DisplayRegistry,
  registerDisplay,
} from 'web/components/dashboard/registry';
import {
  loadDashboardSettingsSuccess,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';

const createDisplayComponent = (displayId: string): DisplayComponent =>
  Object.assign(() => null, {displayId});

let testCounter = 0;

const createDashboardControlsContainerContext = (
  options: {canAdd?: boolean} = {},
) => {
  const {canAdd = true} = options;

  testCounter += 1;

  const displayRegistry: DisplayRegistry = {};
  const firstDisplayId = `first-${testCounter}`;
  const secondDisplayId = `second-${testCounter}`;
  const missingDisplayId = `missing-${testCounter}`;

  registerDisplay(
    createDisplayComponent(firstDisplayId),
    'First display',
    displayRegistry,
  );
  registerDisplay(
    createDisplayComponent(secondDisplayId),
    'Second display',
    displayRegistry,
  );

  const rows = [
    {id: 'row-1', items: [{id: 'item-1', displayId: firstDisplayId}]},
  ];

  const settings = {
    maxItemsPerRow: canAdd ? 2 : 1,
    maxRows: 1,
    permittedDisplays: [firstDisplayId, missingDisplayId, secondDisplayId],
    rows,
  };

  const gmp = {
    dashboard: {
      saveSetting: testing.fn(() => Promise.resolve({})),
    },
  };

  const {render, store} = rendererWith({gmp, store: true});

  store.dispatch(loadDashboardSettingsSuccess('dashboard-1', settings, {}));
  store.dispatch(setDashboardSettingDefaults('dashboard-1', settings));

  render(
    <DashboardControlsContainer
      dashboardId="dashboard-1"
      displayRegistry={displayRegistry}
    />,
  );

  return {
    firstDisplayId,
    gmp,
    settings,
  };
};

describe('DashboardControlsContainer', () => {
  beforeEach(() => {
    testing.clearAllMocks();
  });

  test('should reset settings via dispatch flow', () => {
    const {gmp, settings} = createDashboardControlsContainerContext();

    fireEvent.click(screen.getByTestId('reset-dashboard'));

    expect(gmp.dashboard.saveSetting).toHaveBeenCalledWith(
      'dashboard-1',
      settings,
    );
  });

  test('should open the dialog and add the first registered display', () => {
    const {firstDisplayId, gmp} = createDashboardControlsContainerContext();

    fireEvent.click(screen.getByTestId('add-dashboard-display'));

    expect(screen.getDialogTitle()).toHaveTextContent(
      'Add new Dashboard Display',
    );
    expect(screen.getByText('First display')).toBeInTheDocument();
    expect(screen.getByText('Second display')).toBeInTheDocument();

    fireEvent.click(screen.getDialogSaveButton());

    expect(gmp.dashboard.saveSetting).toHaveBeenCalledWith(
      'dashboard-1',
      expect.objectContaining({
        rows: [
          expect.objectContaining({
            items: [
              expect.objectContaining({displayId: firstDisplayId}),
              expect.objectContaining({displayId: firstDisplayId}),
            ],
          }),
        ],
      }),
    );
  });

  test('should close the dialog when onClose is triggered', () => {
    createDashboardControlsContainerContext();

    fireEvent.click(screen.getByTestId('add-dashboard-display'));
    fireEvent.click(screen.getDialogCloseButton());

    expect(
      screen.queryByText('Add new Dashboard Display'),
    ).not.toBeInTheDocument();
  });

  test('should disable adding when canAdd is false', () => {
    createDashboardControlsContainerContext({canAdd: false});

    const addButton = screen.getByTestId('add-dashboard-display');
    expect(addButton).toHaveAttribute('title', 'Dashboard limit reached');

    fireEvent.click(addButton);

    expect(
      screen.queryByText('Add new Dashboard Display'),
    ).not.toBeInTheDocument();
  });
});
