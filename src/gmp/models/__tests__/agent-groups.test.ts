/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AgentGroup from 'gmp/models/agent-groups';
import {testModel} from 'gmp/models/testing';

testModel(AgentGroup, 'agentgroup');

describe('AgentGroup model tests', () => {
  test('should parse agents with _id attribute', () => {
    const element = {
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
    };
    const agentGroup = AgentGroup.fromElement(element);

    expect(agentGroup.agents).toBeDefined();
    expect(agentGroup.agents?.length).toEqual(2);
    expect(agentGroup.agents?.[0].id).toEqual(
      '0848ca83-2598-4945-b442-e4590f35159d',
    );
    expect(agentGroup.agents?.[0].name).toEqual('GAT-29-bfXw1Ek4');
    expect(agentGroup.agents?.[1].id).toEqual(
      '0848ca83-2598-4915-b442-e4590f35159d',
    );
    expect(agentGroup.agents?.[1].name).toEqual('GAT-30-bfXw1Ek4');
  });

  test('should parse agents with id attribute', () => {
    const element = {
      agents: {
        agent: [
          {id: '6b9ac61f-aaaa-bbbb-cccc-ddeeff001122', name: 'GAT-29'},
          {id: '6b9ac61f-bbbb-cccc-dddd-eeff00112233', name: 'GAT-29-p0MPX0FT'},
        ],
      },
    };
    const agentGroup = AgentGroup.fromElement(element);

    expect(agentGroup.agents).toBeDefined();
    expect(agentGroup.agents?.length).toEqual(2);
    expect(agentGroup.agents?.[0].id).toEqual(
      '6b9ac61f-aaaa-bbbb-cccc-ddeeff001122',
    );
    expect(agentGroup.agents?.[0].name).toEqual('GAT-29');
    expect(agentGroup.agents?.[1].id).toEqual(
      '6b9ac61f-bbbb-cccc-dddd-eeff00112233',
    );
    expect(agentGroup.agents?.[1].name).toEqual('GAT-29-p0MPX0FT');
  });

  test('should parse single agent', () => {
    const element = {
      agents: {
        agent: {
          id: '6b9ac61f-ffff-0000-1111-223344556677',
          name: 'Staging-Agent-01',
        },
      },
    };
    const agentGroup = AgentGroup.fromElement(element);

    expect(agentGroup.agents).toBeDefined();
    expect(agentGroup.agents?.length).toEqual(1);
    expect(agentGroup.agents?.[0].id).toEqual(
      '6b9ac61f-ffff-0000-1111-223344556677',
    );
    expect(agentGroup.agents?.[0].name).toEqual('Staging-Agent-01');
  });

  test('should handle empty agents element', () => {
    const element = {
      agents: {},
    };
    const agentGroup = AgentGroup.fromElement(element);

    expect(agentGroup.agents).toBeDefined();
    expect(agentGroup.agents?.length).toEqual(0);
  });

  test('should handle missing agents element', () => {
    const element = {};
    const agentGroup = AgentGroup.fromElement(element);

    expect(agentGroup.agents).toBeUndefined();
  });

  test('should handle agents as direct array', () => {
    const element = {
      agents: [
        {id: 'direct-1', name: 'Direct Agent 1'},
        {id: 'direct-2', name: 'Direct Agent 2'},
      ],
    };
    const agentGroup = AgentGroup.fromElement(element);

    expect(agentGroup.agents).toBeDefined();
    expect(agentGroup.agents?.length).toEqual(2);
    expect(agentGroup.agents?.[0].id).toEqual('direct-1');
    expect(agentGroup.agents?.[0].name).toEqual('Direct Agent 1');
    expect(agentGroup.agents?.[1].id).toEqual('direct-2');
    expect(agentGroup.agents?.[1].name).toEqual('Direct Agent 2');
  });

  test('should parse scanner', () => {
    const element = {
      scanner: {
        _id: '3b4be213-281f-49ee-b457-5a5f34f71510',
        name: 'Agent Controller',
      },
    };
    const agentGroup = AgentGroup.fromElement(element);

    expect(agentGroup.scanner).toBeDefined();
    expect(agentGroup.scanner?.id).toEqual(
      '3b4be213-281f-49ee-b457-5a5f34f71510',
    );
    expect(agentGroup.scanner?.name).toEqual('Agent Controller');
  });

  test('should parse name and comment', () => {
    const element = {
      name: 'Production Agent Group',
      comment: 'Primary agent group for production environment',
    };
    const agentGroup = AgentGroup.fromElement(element);

    expect(agentGroup.name).toEqual('Production Agent Group');
    expect(agentGroup.comment).toEqual(
      'Primary agent group for production environment',
    );
  });
});
