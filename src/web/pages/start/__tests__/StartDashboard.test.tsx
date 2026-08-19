/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {render} from 'web/testing';
import {vi} from 'vitest';
import StartDashboard from 'web/pages/start/StartDashboard';

const dashboardControlsProps: unknown[] = [];
const dashboardViewProps: unknown[] = [];

vi.mock('web/components/dashboard/DashboardControls', () => ({
  default: (props: unknown) => {
    dashboardControlsProps.push(props);
    return null;
  },
}));

vi.mock('web/components/dashboard/DashboardView', () => ({
  default: (props: unknown) => {
    dashboardViewProps.push(props);
    return null;
  },
}));

const createSettings = ({full = false}: {full?: boolean} = {}) => ({
  maxItemsPerRow: full ? 1 : 2,
  maxRows: 1,
  rows: [
    {
      id: 'row-1',
      items: [{id: 'item-1', displayId: 'task-by-severity-class'}],
    },
  ],
});

describe('StartDashboard', () => {
  beforeEach(() => {
    testing.clearAllMocks();
    dashboardControlsProps.length = 0;
    dashboardViewProps.length = 0;
  });

  test('should pass dashboard controls and view props', () => {
    const settings = createSettings();
    const loadSettings = testing.fn();
    const saveSettings = testing.fn();
    const setDefaultSettings = testing.fn();
    const notify = testing.fn();
    const onNewDisplay = testing.fn();
    const onResetDashboard = testing.fn();

    render(
      <StartDashboard
        id="dashboard-1"
        loadSettings={loadSettings}
        notify={notify}
        saveSettings={saveSettings}
        setDefaultSettings={setDefaultSettings}
        settings={settings}
        onNewDisplay={onNewDisplay}
        onResetDashboard={onResetDashboard}
      />,
    );

    expect(dashboardControlsProps).toHaveLength(1);
    expect(dashboardViewProps).toHaveLength(1);
    expect(dashboardControlsProps[0]).toHaveProperty('canAdd', true);
    expect(dashboardControlsProps[0]).toHaveProperty(
      'dashboardId',
      'dashboard-1',
    );
    expect(dashboardControlsProps[0]).toHaveProperty(
      'displayIds',
      expect.arrayContaining(['task-by-severity-class', 'task-by-status']),
    );
    expect(dashboardControlsProps[0]).toHaveProperty(
      'onNewDisplay',
      onNewDisplay,
    );
    expect(dashboardControlsProps[0]).toHaveProperty(
      'onResetClick',
      onResetDashboard,
    );
    expect(dashboardControlsProps[0]).toHaveProperty('settings', settings);
    expect(dashboardViewProps[0]).toHaveProperty(
      'defaultDisplays',
      expect.any(Array),
    );
    expect(dashboardViewProps[0]).toHaveProperty('id', 'dashboard-1');
    expect(dashboardViewProps[0]).toHaveProperty('isLoading', false);
    expect(dashboardViewProps[0]).toHaveProperty('loadSettings', loadSettings);
    expect(dashboardViewProps[0]).toHaveProperty('notify', notify);
    expect(dashboardViewProps[0]).toHaveProperty(
      'permittedDisplays',
      expect.arrayContaining(['task-by-severity-class', 'task-by-status']),
    );
    expect(dashboardViewProps[0]).toHaveProperty('saveSettings', saveSettings);
    expect(dashboardViewProps[0]).toHaveProperty(
      'setDefaultSettings',
      setDefaultSettings,
    );
    expect(dashboardViewProps[0]).toHaveProperty('settings', settings);
    expect(dashboardViewProps[0]).toHaveProperty('showFilterSelection', true);
    expect(dashboardViewProps[0]).toHaveProperty('showFilterString', true);
  });

  test('should disable adding displays when the dashboard is full', () => {
    render(
      <StartDashboard
        id="dashboard-1"
        saveSettings={testing.fn()}
        setDefaultSettings={testing.fn()}
        settings={createSettings({full: true})}
        onNewDisplay={testing.fn()}
        onResetDashboard={testing.fn()}
      />,
    );

    expect(dashboardControlsProps[0]).toHaveProperty('canAdd', false);
  });
});
