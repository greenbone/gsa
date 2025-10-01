/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWithTable, within} from 'web/testing';
import {TrashCanGetData} from 'gmp/commands/trashcan';
import AgentGroup from 'gmp/models/agentgroup';
import Alert from 'gmp/models/alert';
import Audit from 'gmp/models/audit';
import Credential from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import Group from 'gmp/models/group';
import Note from 'gmp/models/note';
import Override from 'gmp/models/override';
import Permission from 'gmp/models/permission';
import Policy from 'gmp/models/policy';
import PortList from 'gmp/models/portlist';
import ReportConfig from 'gmp/models/reportconfig';
import ReportFormat from 'gmp/models/reportformat';
import Role from 'gmp/models/role';
import ScanConfig from 'gmp/models/scanconfig';
import Scanner from 'gmp/models/scanner';
import Schedule from 'gmp/models/schedule';
import Tag from 'gmp/models/tag';
import Target from 'gmp/models/target';
import Task from 'gmp/models/task';
import Ticket from 'gmp/models/ticket';
import TrashCanTableContents from 'web/pages/trashcan/TrashCanTableContents';

describe('TrashCanTableContents tests', () => {
  const mockTrashData: TrashCanGetData = {
    alerts: [new Alert({id: '1'})],
    audits: [],
    credentials: [new Credential({id: '2'}), new Credential({id: '3'})],
    filters: [],
    groups: [],
    notes: [],
    overrides: [],
    permissions: [],
    policies: [],
    portLists: [],
    reportConfigs: [],
    reportFormats: [],
    roles: [],
    scanConfigs: [],
    scanners: [],
    schedules: [],
    tags: [],
    targets: [],
    tasks: [],
    tickets: [],
    agentGroups: [],
  };

  test('renders rows for non-empty trash categories', () => {
    const {render} = rendererWithTable();
    render(<TrashCanTableContents trash={mockTrashData} />);

    expect(screen.queryByText('Alerts')).toBeInTheDocument();
    expect(screen.queryByText('Credentials')).toBeInTheDocument();
    expect(screen.queryByText('Audits')).not.toBeInTheDocument();
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    expect(screen.queryByText('Groups')).not.toBeInTheDocument();
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
    expect(screen.queryByText('Overrides')).not.toBeInTheDocument();
    expect(screen.queryByText('Permissions')).not.toBeInTheDocument();
    expect(screen.queryByText('Policies')).not.toBeInTheDocument();
    expect(screen.queryByText('Port Lists')).not.toBeInTheDocument();
    expect(screen.queryByText('Report Configs')).not.toBeInTheDocument();
    expect(screen.queryByText('Report Formats')).not.toBeInTheDocument();
    expect(screen.queryByText('Roles')).not.toBeInTheDocument();
    expect(screen.queryByText('Scan Configs')).not.toBeInTheDocument();
    expect(screen.queryByText('Scanners')).not.toBeInTheDocument();
    expect(screen.queryByText('Schedules')).not.toBeInTheDocument();
    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    expect(screen.queryByText('Targets')).not.toBeInTheDocument();
    expect(screen.queryByText('Tasks')).not.toBeInTheDocument();
    expect(screen.queryByText('Tickets')).not.toBeInTheDocument();
    expect(screen.queryByText('Agent Groups')).not.toBeInTheDocument();
  });

  test('should render all categories', () => {
    const mockAllTrashData: TrashCanGetData = {
      alerts: [new Alert({id: 'alert1'})],
      audits: [new Audit({id: 'audit1'})],
      credentials: [new Credential({id: 'credential1'})],
      filters: [new Filter({id: 'filter1'})],
      groups: [new Group({id: 'group1'})],
      notes: [new Note({id: 'note1'})],
      overrides: [new Override({id: 'override1'})],
      permissions: [new Permission({id: 'permission1'})],
      policies: [new Policy({id: 'policy1'})],
      portLists: [new PortList({id: 'portlist1'})],
      reportConfigs: [new ReportConfig({id: 'reportconfig1'})],
      reportFormats: [new ReportFormat({id: 'reportformat1'})],
      roles: [new Role({id: 'role1'})],
      scanConfigs: [new ScanConfig({id: 'scanconfig1'})],
      scanners: [new Scanner({id: 'scanner1'})],
      schedules: [new Schedule({id: 'schedule1'})],
      tags: [new Tag({id: 'tag1'})],
      targets: [new Target({id: 'target1'})],
      tasks: [new Task({id: 'task1'})],
      tickets: [new Ticket({id: 'ticket1'})],
      agentGroups: [new AgentGroup({id: 'agentgroup1'})],
    };
    const {render} = rendererWithTable();
    render(<TrashCanTableContents trash={mockAllTrashData} />);

    expect(screen.queryByText('Alerts')).toBeInTheDocument();
    expect(screen.queryByText('Credentials')).toBeInTheDocument();
    expect(screen.queryByText('Audits')).toBeInTheDocument();
    expect(screen.queryByText('Filters')).toBeInTheDocument();
    expect(screen.queryByText('Groups')).toBeInTheDocument();
    expect(screen.queryByText('Notes')).toBeInTheDocument();
    expect(screen.queryByText('Overrides')).toBeInTheDocument();
    expect(screen.queryByText('Permissions')).toBeInTheDocument();
    expect(screen.queryByText('Policies')).toBeInTheDocument();
    expect(screen.queryByText('Port Lists')).toBeInTheDocument();
    expect(screen.queryByText('Report Configs')).toBeInTheDocument();
    expect(screen.queryByText('Report Formats')).toBeInTheDocument();
    expect(screen.queryByText('Roles')).toBeInTheDocument();
    expect(screen.queryByText('Scan Configs')).toBeInTheDocument();
    expect(screen.queryByText('Scanners')).toBeInTheDocument();
    expect(screen.queryByText('Schedules')).toBeInTheDocument();
    expect(screen.queryByText('Tags')).toBeInTheDocument();
    expect(screen.queryByText('Targets')).toBeInTheDocument();
    expect(screen.queryByText('Tasks')).toBeInTheDocument();
    expect(screen.queryByText('Tickets')).toBeInTheDocument();
    expect(screen.queryByText('Agent Groups')).toBeInTheDocument();
  });

  test('renders nothing when trash is undefined', () => {
    const {render} = rendererWithTable();
    const {element} = render(<TrashCanTableContents trash={undefined} />);
    expect(element).toBeEmptyDOMElement();
  });

  test('renders correct count for each category', () => {
    const {render} = rendererWithTable();
    render(<TrashCanTableContents trash={mockTrashData} />);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2);

    expect(within(rows[0]).getAllByRole('cell')[1]).toHaveTextContent('1');
    expect(within(rows[1]).getAllByRole('cell')[1]).toHaveTextContent('2');
  });
});
