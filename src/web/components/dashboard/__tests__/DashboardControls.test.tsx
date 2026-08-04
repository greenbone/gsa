/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import DashboardControls from 'web/components/dashboard/DashboardControls';
import {
  type DisplayComponent,
  type DisplayRegistry,
  registerDisplay,
} from 'web/components/dashboard/registry';

const createDisplayComponent = (displayId: string): DisplayComponent =>
  Object.assign(() => null, {displayId});

let testCounter = 0;

const createTestData = ({canAdd = true}: {canAdd?: boolean} = {}) => {
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

  return {
    displayRegistry,
    firstDisplayId,
    secondDisplayId,
    settings,
  };
};

const createDashboardControlsContext = (options: {canAdd?: boolean} = {}) => {
  const {canAdd = true} = options;
  const {displayRegistry, firstDisplayId, settings} = createTestData({canAdd});

  const onNewDisplay = testing.fn();
  const onResetClick = testing.fn();

  render(
    <DashboardControls
      canAdd={canAdd}
      dashboardId="dashboard-1"
      displayIds={settings.permittedDisplays}
      displayRegistry={displayRegistry}
      settings={settings}
      onNewDisplay={onNewDisplay}
      onResetClick={onResetClick}
    />,
  );

  return {
    firstDisplayId,
    onNewDisplay,
    onResetClick,
    settings,
  };
};

describe('DashboardControls', () => {
  beforeEach(() => {
    testing.clearAllMocks();
  });

  test('should call onResetClick with dashboard id', () => {
    const {onResetClick} = createDashboardControlsContext();

    fireEvent.click(screen.getByTestId('reset-dashboard'));

    expect(onResetClick).toHaveBeenCalledWith('dashboard-1');
  });

  test('should call onNewDisplay when adding a display', () => {
    const {firstDisplayId, onNewDisplay, settings} =
      createDashboardControlsContext();

    fireEvent.click(screen.getByTestId('add-dashboard-display'));
    fireEvent.click(screen.getDialogSaveButton());

    expect(onNewDisplay).toHaveBeenCalledWith(
      settings,
      'dashboard-1',
      firstDisplayId,
    );
  });
});
