/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import {DashboardControls} from 'web/components/dashboard/DashboardControls';
import {
  type DisplayComponent,
  type DisplayRegistry,
  registerDisplay,
} from 'web/components/dashboard/registry';
import type {I18n} from 'web/hooks/useTranslation';

const createDisplayComponent = (displayId: string): DisplayComponent =>
  Object.assign(() => null, {displayId});

let testCounter = 0;

const createTestProps = () => {
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

  const settings = {
    rows: [{id: 'row-1', items: [{id: 'item-1', displayId: firstDisplayId}]}],
  };

  return {
    firstDisplayId,
    missingDisplayId,
    secondDisplayId,
    props: {
      _: (message: string) => message,
      canAdd: true,
      dashboardId: 'dashboard-1',
      displayRegistry,
      displayIds: [firstDisplayId, missingDisplayId, secondDisplayId],
      i18n: {} as I18n,
      onNewDisplay: testing.fn(),
      onResetClick: testing.fn(),
      settings,
    },
    settings,
  };
};

describe('DashboardControls', () => {
  beforeEach(() => {
    testing.clearAllMocks();
  });

  test('should call onResetClick with the dashboard id', () => {
    const {props} = createTestProps();

    render(<DashboardControls {...props} />);

    fireEvent.click(screen.getByTestId('reset-dashboard'));

    expect(props.onResetClick).toHaveBeenCalledWith('dashboard-1');
  });

  test('should open the dialog and add the first registered display', () => {
    const {firstDisplayId, props, settings} = createTestProps();

    render(<DashboardControls {...props} />);

    fireEvent.click(screen.getByTestId('add-dashboard-display'));

    expect(screen.getDialogTitle()).toHaveTextContent(
      'Add new Dashboard Display',
    );
    expect(screen.getByText('First display')).toBeInTheDocument();
    expect(screen.getByText('Second display')).toBeInTheDocument();

    fireEvent.click(screen.getDialogSaveButton());

    expect(props.onNewDisplay).toHaveBeenCalledWith(
      settings,
      'dashboard-1',
      firstDisplayId,
    );
  });

  test('should close the dialog when onClose is triggered', () => {
    const {props} = createTestProps();

    render(<DashboardControls {...props} />);

    fireEvent.click(screen.getByTestId('add-dashboard-display'));
    fireEvent.click(screen.getDialogCloseButton());

    expect(
      screen.queryByText('Add new Dashboard Display'),
    ).not.toBeInTheDocument();
  });

  test('should disable adding when canAdd is false', () => {
    const {props} = createTestProps();

    render(<DashboardControls {...props} canAdd={false} />);

    const addButton = screen.getByTestId('add-dashboard-display');
    expect(addButton).toHaveAttribute('title', 'Dashboard limit reached');

    fireEvent.click(addButton);

    expect(
      screen.queryByText('Add new Dashboard Display'),
    ).not.toBeInTheDocument();
  });
});
