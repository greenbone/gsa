/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  screen,
  rendererWith,
  waitFor,
  fireEvent,
  wait,
  within,
} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Features from 'gmp/capabilities/features';
import AgentGroup from 'gmp/models/agent-group';
import Alert from 'gmp/models/alert';
import Audit from 'gmp/models/audit';
import Credential from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import Group from 'gmp/models/group';
import Note from 'gmp/models/note';
import OciImageTarget from 'gmp/models/oci-image-target';
import Override from 'gmp/models/override';
import Permission from 'gmp/models/permission';
import Policy from 'gmp/models/policy';
import PortList from 'gmp/models/port-list';
import ReportConfig from 'gmp/models/report-config';
import ReportFormat from 'gmp/models/report-format';
import Role from 'gmp/models/role';
import ScanConfig, {type ScanConfigFamilies} from 'gmp/models/scan-config';
import Scanner from 'gmp/models/scanner';
import Schedule from 'gmp/models/schedule';
import Tag from 'gmp/models/tag';
import Target from 'gmp/models/target';
import Task from 'gmp/models/task';
import Ticket from 'gmp/models/ticket';
import WebApplicationTarget from 'gmp/models/web-application-target';
import TrashcanPage from 'web/pages/trashcan/TrashCanPage';

/*
 * The following is a workaround for userEvent v14 and fake timers https://github.com/testing-library/react-testing-library/issues/1197
 */

testing.useFakeTimers({
  shouldAdvanceTime: true,
});

const gmp = {
  trashcan: {
    empty: testing.fn().mockResolvedValueOnce({}),
    get: testing.fn().mockResolvedValue({
      data: {},
    }),
  },
  settings: {
    manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
  },
};

const capabilities = new Capabilities(['everything']);

describe('TrashCanPage tests', () => {
  test('Should render with empty trashcan button and empty out trash', async () => {
    const {render} = rendererWith({
      gmp,
      capabilities,
      store: true,
    });

    render(<TrashcanPage />);

    expect(screen.queryByTestId('loading')).toBeVisible();
    await wait();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    const emptyTrashcanButton = screen.getByRole('button', {
      name: /Empty Trash/i,
    });

    fireEvent.click(emptyTrashcanButton);
    await wait();
    expect(
      screen.getByText('Are you sure you want to empty the trash?'),
    ).toBeVisible();

    const confirmButton = screen.getByRole('button', {name: /Confirm/i});
    fireEvent.click(confirmButton);
    expect(gmp.trashcan.empty).toHaveBeenCalled();

    await wait();

    await waitFor(() => {
      expect(confirmButton).not.toBeVisible();
    });
  });

  test('Should render with empty trashcan button and handle error case', async () => {
    const errorGmp = {
      ...gmp,
      trashcan: {
        ...gmp.trashcan,
        empty: testing
          .fn()
          .mockRejectedValue(new Error('Failed to empty trash')),
      },
    };
    const {render} = rendererWith({
      gmp: errorGmp,
      capabilities,
      store: true,
    });

    render(<TrashcanPage />);
    expect(screen.queryByTestId('loading')).toBeVisible();

    await wait();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    const emptyTrashcanButton = screen.getByRole('button', {
      name: /Empty Trash/i,
    });

    fireEvent.click(emptyTrashcanButton);
    await wait();
    expect(
      screen.getByText('Are you sure you want to empty the trash?'),
    ).toBeVisible();

    const confirmButton = screen.getByRole('button', {name: /Confirm/i});
    fireEvent.click(confirmButton);
    expect(errorGmp.trashcan.empty).toHaveBeenCalled();
    await wait();
    expect(
      screen.getByText(
        'An error occurred while emptying the trash, please try again.',
      ),
    ).toBeVisible();
  });

  test('Should render open and close dialog', async () => {
    const {render} = rendererWith({
      gmp,
      capabilities,
      store: true,
    });

    render(<TrashcanPage />);
    expect(screen.queryByTestId('loading')).toBeVisible();
    await wait();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    const emptyTrashcanButton = screen.getByRole('button', {
      name: /Empty Trash/i,
    });

    fireEvent.click(emptyTrashcanButton);
    expect(
      screen.getByText('Are you sure you want to empty the trash?'),
    ).toBeVisible();

    const cancelButton = screen.getByRole('button', {name: /Cancel/i});
    fireEvent.click(cancelButton);
    expect(cancelButton).not.toBeVisible();
  });

  test('should render only restore and trash delete actions in every table', async () => {
    const trashData = {
      alerts: [new Alert({id: 'alert'})],
      audits: [new Audit({id: 'audit'})],
      credentials: [new Credential({id: 'credential'})],
      filters: [new Filter({id: 'filter'})],
      groups: [new Group({id: 'group'})],
      notes: [new Note({id: 'note'})],
      overrides: [new Override({id: 'override'})],
      permissions: [new Permission({id: 'permission', name: 'super'})],
      policies: [new Policy({id: 'policy'})],
      portLists: [new PortList({id: 'port-list'})],
      reportConfigs: [
        new ReportConfig({
          id: 'report-config',
          reportFormat: {id: 'report-format', name: 'XML'},
        }),
      ],
      reportFormats: [
        new ReportFormat({
          id: 'report-format',
          trust: {value: '1'},
        }),
      ],
      roles: [new Role({id: 'role'})],
      scanConfigs: [
        new ScanConfig({
          id: 'scan-config',
          families: {} as ScanConfigFamilies,
          nvts: {count: 0},
        }),
      ],
      scanners: [new Scanner({id: 'scanner'})],
      schedules: [new Schedule({id: 'schedule'})],
      tags: [new Tag({id: 'tag'})],
      targets: [new Target({id: 'target'})],
      tasks: [new Task({id: 'task'})],
      tickets: [new Ticket({id: 'ticket'})],
      agentGroups: [new AgentGroup({id: 'agent-group'})],
      ociImageTargets: [new OciImageTarget({id: 'oci-image-target'})],
      webApplicationTargets: [
        new WebApplicationTarget({id: 'web-application-target'}),
      ],
    };
    const pageGmp = {
      ...gmp,
      trashcan: {
        ...gmp.trashcan,
        get: testing.fn().mockResolvedValue({data: trashData}),
      },
      session: {
        username: 'test-user',
        subscribeToChanges: () => () => undefined,
      },
    };
    const {render} = rendererWith({
      gmp: pageGmp,
      capabilities,
      features: new Features([
        'ENABLE_AGENTS',
        'ENABLE_CONTAINER_SCANNING',
        'ENABLE_WEB_APPLICATION_SCANNING',
      ]),
      store: true,
    });

    render(<TrashcanPage />);
    await wait();

    const tables = screen.getAllByTestId('entities-table');
    expect(tables).toHaveLength(23);

    tables.forEach(table => {
      const restoreIcon = within(table).getByTestId('restore-icon');
      const deleteIcon = within(table).getByTestId('delete-icon');
      const actionCell = restoreIcon.closest('td');

      expect(actionCell).not.toBeNull();
      expect(deleteIcon.closest('td')).toBe(actionCell);

      const actionIconTestIds = Array.from(
        actionCell?.querySelectorAll<HTMLElement>('[data-testid$="-icon"]') ??
          [],
      ).map(icon => icon.dataset.testid);

      expect(actionIconTestIds).toEqual(['restore-icon', 'delete-icon']);
    });
  });
});
