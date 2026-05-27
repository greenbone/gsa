/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  changeInputValue,
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
  wait,
  waitFor,
  within,
} from 'web/testing';
import Response from 'gmp/http/response';
import {createSession} from 'gmp/testing';
import AgentGroupsDialog from 'web/pages/agent-groups/AgentGroupsDialog';

const agent = {
  id: 'a1',
  agentId: 'A1',
  name: 'Agent One',
  hostname: 'host1',
  authorized: true,
  updateToLatest: true,
  config: {
    agentScriptExecutor: {schedulerCronTimes: ['0 0 1 * *']},
    heartbeat: {intervalInSeconds: 77},
  },
};

const scanner = {id: 's1', name: 'Controller One'};

const createGmp = ({
  getScanners = testing.fn().mockResolvedValue(new Response([scanner], {})),
  getAgents = testing.fn().mockResolvedValue(new Response([agent], {})),
} = {}) => ({
  settings: {},
  session: createSession({token: 'token'}),
  scanners: {get: getScanners},
  agents: {get: getAgents},
});

describe('AgentGroupsDialog tests', () => {
  test('should render without issues and close', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    expect(screen.getByText('New Agent Group')).toBeInTheDocument();

    const close = screen.getDialogCloseButton();
    fireEvent.click(close);

    expect(onClose).toHaveBeenCalled();
  });

  test('should call onSave with default values', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      name: 'Unnamed',
      comment: '',
      agentController: '',
      agentIds: [],
      schedulerCronExpression: '0 */12 * * *',
    });
  });

  test('selecting agent controller and agent sets payload values', async () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    const select = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Agent Controller',
    });

    const items = await getSelectItemElementsForSelect(select);
    const item = items.find(i =>
      i.textContent?.includes('Controller One'),
    ) as HTMLElement;

    fireEvent.click(item);
    await wait();

    const dialogContent = screen.getDialogContent();
    let multi: HTMLElement = document.createElement('div');

    await waitFor(() => {
      const multiElements = within(dialogContent).getMultiSelectElements();
      expect(multiElements.length).toBeGreaterThan(0);
      multi = multiElements[0];
    });

    fireEvent.click(multi);

    const agentOption = await screen.findByText(/Agent One/);
    fireEvent.click(agentOption);

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      name: 'Unnamed',
      comment: '',
      agentController: 's1',
      agentIds: ['a1'],
      schedulerCronExpression: '0 */12 * * *',
    });
  });

  test('should show scheduler field when agent controller is selected', async () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const gmp = createGmp({
      getAgents: testing.fn().mockResolvedValue(new Response([], {})),
    });

    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    const select = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Agent Controller',
    });

    const items = await getSelectItemElementsForSelect(select);
    const item = items.find(i =>
      i.textContent?.includes('Controller One'),
    ) as HTMLElement;

    fireEvent.click(item);
    await wait();

    await waitFor(() => {
      expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    });

    expect(screen.getByName('schedulerCronExpression')).toBeInTheDocument();
  });

  test('should not render heartbeat interval or port fields in agent groups dialog', async () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const gmp = createGmp({
      getAgents: testing.fn().mockResolvedValue(new Response([], {})),
    });

    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    const select = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Agent Controller',
    });

    const items = await getSelectItemElementsForSelect(select);
    const item = items.find(i =>
      i.textContent?.includes('Controller One'),
    ) as HTMLElement;

    fireEvent.click(item);
    await wait();

    await waitFor(() => {
      expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    });

    expect(
      screen.queryByText('Heartbeat Interval (seconds)'),
    ).not.toBeInTheDocument();

    expect(screen.queryByText('Port')).not.toBeInTheDocument();
    expect(screen.queryByText('Configuration Details')).not.toBeInTheDocument();
  });

  test('should not include agent configuration values in save payload', async () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    const select = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Agent Controller',
    });

    const items = await getSelectItemElementsForSelect(select);
    const item = items.find(i =>
      i.textContent?.includes('Controller One'),
    ) as HTMLElement;

    fireEvent.click(item);
    await wait();

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      name: 'Unnamed',
      comment: '',
      agentController: 's1',
      agentIds: [],
      schedulerCronExpression: '0 */12 * * *',
    });

    const payload = onSave.mock.calls[0][0];

    expect(payload).not.toHaveProperty('network');
    expect(payload).not.toHaveProperty('port');
    expect(payload).not.toHaveProperty('authorized');
    expect(payload).not.toHaveProperty('updateToLatest');
    expect(payload).not.toHaveProperty('config');
    expect(payload).not.toHaveProperty('intervalInSeconds');
  });

  test('should keep name when agent controller is changed', async () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const scanner1 = {id: 's1', name: 'Controller One'};
    const scanner2 = {id: 's2', name: 'Controller Two'};

    const gmp = createGmp({
      getScanners: testing
        .fn()
        .mockResolvedValue(new Response([scanner1, scanner2], {})),
      getAgents: testing.fn().mockResolvedValue(new Response([], {})),
    });

    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    const nameField = screen.getByName('name');
    changeInputValue(nameField, 'Custom Group');

    const select = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Agent Controller',
    });

    const items = await getSelectItemElementsForSelect(select);
    const item = items.find(i =>
      i.textContent?.includes('Controller One'),
    ) as HTMLElement;

    fireEvent.click(item);
    await wait();

    expect(screen.getByName('name')).toHaveValue('Custom Group');
  });
});
