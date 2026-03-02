/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  fireEvent,
  openSelectElement,
  rendererWith,
  screen,
  wait,
  within,
} from 'web/testing';
import Response from 'gmp/http/response';
import AgentGroupsDialog from 'web/pages/agent-groups/AgentGroupsDialog';

describe('AgentGroupsDialog tests', () => {
  test('should render without issues and close', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const gmp = {
      settings: {token: 'token'},
      scanners: {get: testing.fn().mockResolvedValue(new Response([], {}))},
      agents: {get: testing.fn().mockResolvedValue(new Response([], {}))},
    };

    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    expect(screen.getByText('New Agent Group')).toBeInTheDocument();

    const close = screen.getDialogCloseButton();
    fireEvent.click(close);

    expect(onClose).toHaveBeenCalled();
  });

  test('should call onSave with default values', async () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const gmp = {
      settings: {token: 'token'},
      scanners: {get: testing.fn().mockResolvedValue(new Response([], {}))},
      agents: {get: testing.fn().mockResolvedValue(new Response([], {}))},
    };

    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    // onSave should be called with the dialog defaults
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Unnamed',
        comment: '',
        agentIds: [],
        network: '',
        port: 0,
      }),
    );
  });

  test('selecting agent controller and agent sets payload config and authorized', async () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const agent = {
      id: 'a1',
      agentId: 'A1',
      name: 'Agent One',
      hostname: 'host1',
      authorized: true,
      config: {
        agentScriptExecutor: {schedulerCronTimes: ['0 0 1 * *']},
        heartbeat: {intervalInSeconds: 77},
      },
    };

    const scanner = {id: 's1', name: 'Controller One'};

    const gmp = {
      settings: {token: 'token'},
      scanners: {
        get: testing.fn().mockResolvedValue(new Response([scanner], {})),
      },
      agents: {get: testing.fn().mockResolvedValue(new Response([agent], {}))},
    };

    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    // open agent controller select and choose controller
    const select = screen.getByName('agentController') as HTMLSelectElement;
    await openSelectElement(select);
    const items = screen.getSelectItemElements();
    const item = items.find(i =>
      i.textContent?.includes('Controller One'),
    ) as HTMLElement;
    fireEvent.click(item);
    await wait();
    // now the MultiSelect for agents should be visible and selectable
    const dialogContent = screen.getDialogContent();
    const multiElements = within(dialogContent).getMultiSelectElements();
    const multi = multiElements[0];
    fireEvent.click(multi);

    const options = screen.getSelectItemElementsForMultiSelect();
    const agentOption = options.find(o =>
      o.textContent?.includes('Agent One'),
    ) as HTMLElement;
    fireEvent.click(agentOption);

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        agentController: 's1',
        agentIds: ['a1'],
        authorized: true,
        config: expect.objectContaining({
          heartbeat: expect.objectContaining({intervalInSeconds: 77}),
        }),
      }),
    );

    // intervalInSeconds is removed from the payload since the field is hidden
    expect(onSave).toHaveBeenCalledWith(
      expect.not.objectContaining({intervalInSeconds: expect.anything()}),
    );
  });

  test('should hide heartbeat interval field and show scheduler when agent controller is selected', async () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const scanner = {id: 's1', name: 'Controller One'};

    const gmp = {
      settings: {token: 'token'},
      scanners: {
        get: testing.fn().mockResolvedValue(new Response([scanner], {})),
      },
      agents: {get: testing.fn().mockResolvedValue(new Response([], {}))},
    };

    const {render} = rendererWith({gmp});

    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    const select = screen.getByName('agentController') as HTMLSelectElement;
    await openSelectElement(select);
    const items = screen.getSelectItemElements();
    const item = items.find(i =>
      i.textContent?.includes('Controller One'),
    ) as HTMLElement;
    fireEvent.click(item);
    await wait();

    expect(
      screen.queryByText('Heartbeat Interval (seconds)'),
    ).not.toBeInTheDocument();

    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    expect(screen.getByName('schedulerCronExpression')).toBeInTheDocument();
  });

  test('should keep name when agent controller is changed', async () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const scanner1 = {id: 's1', name: 'Controller One'};
    const scanner2 = {id: 's2', name: 'Controller Two'};

    const gmp = {
      settings: {token: 'token'},
      scanners: {
        get: testing
          .fn()
          .mockResolvedValue(new Response([scanner1, scanner2], {})),
      },
      agents: {get: testing.fn().mockResolvedValue(new Response([], {}))},
    };

    const {render} = rendererWith({gmp});
    render(<AgentGroupsDialog onClose={onClose} onSave={onSave} />);

    // type a custom name
    const nameField = screen.getByName('name');
    fireEvent.change(nameField, {target: {value: 'Custom Group'}});

    // select a controller
    const select = screen.getByName('agentController') as HTMLSelectElement;
    await openSelectElement(select);
    const items = screen.getSelectItemElements();
    const item = items.find(i =>
      i.textContent?.includes('Controller One'),
    ) as HTMLElement;
    fireEvent.click(item);
    await wait();

    // name should NOT have been reset
    expect(screen.getByName('name')).toHaveValue('Custom Group');
  });
});
