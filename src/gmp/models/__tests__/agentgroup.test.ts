/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentGroup from 'gmp/models/agentgroup';
import {testModel} from 'gmp/models/testing';

testModel(AgentGroup, 'agentgroup');

describe('AgentGroup model tests', () => {
  test('should use defaults', () => {
    const agentGroup = new AgentGroup();

    expect(agentGroup.id).toBeUndefined();
    expect(agentGroup.name).toBeUndefined();
    expect(agentGroup.comment).toBeUndefined();
    expect(agentGroup.scanner).toBeUndefined();
    expect(agentGroup.agents).toEqual([]);
  });

  test('should parse agents', () => {
    const agentGroup = AgentGroup.fromElement({
      agents: {
        agent: [
          {
            _id: '0848ca83-2598-4945-b442-e4590f35159d',
            name: 'GAT-29-bfXw1Ek4',
          },
          {
            _id: '0848ca83-2598-4915-b442-e4590f35159d',
            name: 'GAT-30-bfXw1Ek4',
          },
        ],
      },
    });

    expect(agentGroup.agents).toBeDefined();
    expect(agentGroup.agents.length).toEqual(2);
    expect(agentGroup.agents[0].id).toEqual(
      '0848ca83-2598-4945-b442-e4590f35159d',
    );
    expect(agentGroup.agents[0].name).toEqual('GAT-29-bfXw1Ek4');
    expect(agentGroup.agents[1].id).toEqual(
      '0848ca83-2598-4915-b442-e4590f35159d',
    );
    expect(agentGroup.agents?.[1].name).toEqual('GAT-30-bfXw1Ek4');
  });

  test('should parse single agent', () => {
    const agentGroup = AgentGroup.fromElement({
      agents: {
        agent: {
          _id: '6b9ac61f-ffff-0000-1111-223344556677',
          name: 'Staging-Agent-01',
        },
      },
    });

    expect(agentGroup.agents).toBeDefined();
    expect(agentGroup.agents.length).toEqual(1);
    expect(agentGroup.agents[0].id).toEqual(
      '6b9ac61f-ffff-0000-1111-223344556677',
    );
    expect(agentGroup.agents[0].name).toEqual('Staging-Agent-01');
  });

  test('should handle empty agents element', () => {
    const agentGroup = AgentGroup.fromElement({
      agents: {},
    });

    expect(agentGroup.agents).toEqual([]);
  });

  test('should handle missing agents element', () => {
    const agentGroup = AgentGroup.fromElement();

    expect(agentGroup.agents).toEqual([]);
  });

  test('should parse scanner', () => {
    const agentGroup = AgentGroup.fromElement({
      scanner: {
        _id: '3b4be213-281f-49ee-b457-5a5f34f71510',
        name: 'Agent Controller',
      },
    });

    expect(agentGroup.scanner).toBeDefined();
    expect(agentGroup.scanner?.id).toEqual(
      '3b4be213-281f-49ee-b457-5a5f34f71510',
    );
    expect(agentGroup.scanner?.name).toEqual('Agent Controller');
  });
});
