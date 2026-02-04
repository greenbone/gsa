/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Agent from 'gmp/models/agent';
import date from 'gmp/models/date';
import {testModel} from 'gmp/models/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

describe('Agent model tests', () => {
  testModel(Agent, 'agent');

  test('should use defaults', () => {
    const agent = new Agent();

    expect(agent.id).toBeUndefined();
    expect(agent.name).toBeUndefined();
    expect(agent.comment).toBeUndefined();
    expect(agent.hostname).toBeUndefined();
    expect(agent.agentId).toBeUndefined();
    expect(agent.authorized).toBeUndefined();
    expect(agent.connectionStatus).toBeUndefined();
    expect(agent.lastUpdate).toBeUndefined();
    expect(agent.lastUpdaterHeartbeat).toBeUndefined();
    expect(agent.updaterVersion).toBeUndefined();
    expect(agent.agentVersion).toBeUndefined();
    expect(agent.operatingSystem).toBeUndefined();
    expect(agent.architecture).toBeUndefined();
    expect(agent.updateToLatest).toBeUndefined();
    expect(agent.agentUpdateAvailable).toBeUndefined();
    expect(agent.updaterUpdateAvailable).toBeUndefined();
    expect(agent.schedule).toBeUndefined();
    expect(agent.ipAddresses).toBeUndefined();
    expect(agent.scanner).toBeUndefined();
    expect(agent.latestAgentVersion).toBeUndefined();
    expect(agent.latestUpdaterVersion).toBeUndefined();
    expect(agent.config).toBeUndefined();
  });

  test('should parse defaults', () => {
    const agent = Agent.fromElement({});

    expect(agent.id).toBeUndefined();
    expect(agent.name).toBeUndefined();
    expect(agent.comment).toBeUndefined();
    expect(agent.hostname).toBeUndefined();
    expect(agent.agentId).toBeUndefined();
    expect(agent.authorized).toBeUndefined();
    expect(agent.connectionStatus).toBeUndefined();
    expect(agent.lastUpdate).toBeUndefined();
    expect(agent.lastUpdaterHeartbeat).toBeUndefined();
    expect(agent.updaterVersion).toBeUndefined();
    expect(agent.agentVersion).toBeUndefined();
    expect(agent.operatingSystem).toBeUndefined();
    expect(agent.architecture).toBeUndefined();
    expect(agent.updateToLatest).toBeUndefined();
    expect(agent.agentUpdateAvailable).toBeUndefined();
    expect(agent.updaterUpdateAvailable).toBeUndefined();
    expect(agent.schedule).toBeUndefined();
    expect(agent.ipAddresses).toBeUndefined();
    expect(agent.scanner).toBeUndefined();
    expect(agent.latestAgentVersion).toBeUndefined();
    expect(agent.latestUpdaterVersion).toBeUndefined();
    expect(agent.config).toBeUndefined();
  });

  test('should parse hostname', () => {
    const agent = Agent.fromElement({hostname: 'agent-hostname'});
    expect(agent.hostname).toEqual('agent-hostname');
  });

  test('should parse ipAddresses', () => {
    const agent = Agent.fromElement({ip: ['192.168.1.1', '192.168.1.2']});
    expect(agent.ipAddresses).toEqual(['192.168.1.1', '192.168.1.2']);
  });

  test('should parse single ipAddress', () => {
    const agent = Agent.fromElement({ip: '192.168.1.1'});
    expect(agent.ipAddresses).toEqual(['192.168.1.1']);
  });

  test('should parse agentId', () => {
    const agent = Agent.fromElement({agent_id: 'agent-1234'});
    expect(agent.agentId).toEqual('agent-1234');
  });

  test('should parse authorized', () => {
    const agentTrue = Agent.fromElement({authorized: YES_VALUE});
    expect(agentTrue.authorized).toEqual(true);

    const agentFalse = Agent.fromElement({authorized: NO_VALUE});
    expect(agentFalse.authorized).toEqual(false);
  });

  test('should parse agent_update_available', () => {
    const agentTrue = Agent.fromElement({agent_update_available: YES_VALUE});
    expect(agentTrue.agentUpdateAvailable).toEqual(true);

    const agentFalse = Agent.fromElement({agent_update_available: NO_VALUE});
    expect(agentFalse.agentUpdateAvailable).toEqual(false);
  });

  test('should parse updater_update_available', () => {
    const agentTrue = Agent.fromElement({updater_update_available: YES_VALUE});
    expect(agentTrue.updaterUpdateAvailable).toEqual(true);

    const agentFalse = Agent.fromElement({updater_update_available: NO_VALUE});
    expect(agentFalse.updaterUpdateAvailable).toEqual(false);
  });

  test('should parse connectionStatus', () => {
    const agent = Agent.fromElement({connection_status: 'connected'});
    expect(agent.connectionStatus).toEqual('connected');
  });

  test('should parse lastUpdate', () => {
    const agent = Agent.fromElement({last_update: '2024-01-01T12:00:00Z'});
    expect(agent.lastUpdate).toEqual(date('2024-01-01T12:00:00.000Z'));
  });

  test('should parse lastUpdaterHeartbeat', () => {
    const agent = Agent.fromElement({
      last_updater_heartbeat: '2024-01-02T15:30:00Z',
    });
    expect(agent.lastUpdaterHeartbeat).toEqual(
      date('2024-01-02T15:30:00.000Z'),
    );
  });

  test('should parse updaterVersion', () => {
    const agent = Agent.fromElement({updater_version: '1.2.3'});
    expect(agent.updaterVersion).toEqual('1.2.3');
  });

  test('should parse agentVersion', () => {
    const agent = Agent.fromElement({agent_version: '4.5.6'});
    expect(agent.agentVersion).toEqual('4.5.6');
  });

  test('should parse operatingSystem', () => {
    const agent = Agent.fromElement({operating_system: 'Linux'});
    expect(agent.operatingSystem).toEqual('Linux');
  });

  test('should parse architecture', () => {
    const agent = Agent.fromElement({architecture: 'x86_64'});
    expect(agent.architecture).toEqual('x86_64');
  });

  test('should parse updateToLatest boolean', () => {
    const agentTrue = Agent.fromElement({update_to_latest: YES_VALUE});
    expect(agentTrue.updateToLatest).toEqual(true);

    const agentFalse = Agent.fromElement({update_to_latest: NO_VALUE});
    expect(agentFalse.updateToLatest).toEqual(false);
  });

  test('should parse schedule', () => {
    const agent = Agent.fromElement({schedule: 'daily at 2am'});
    expect(agent.schedule).toEqual('daily at 2am');
  });

  test('should parse scanner', () => {
    const agent = Agent.fromElement({
      scanner: {
        _id: '3b4be213-281f-49ee-b457-5a5f34f71510',
        name: 'Agent1',
      },
    });

    expect(agent.scanner?.id).toEqual('3b4be213-281f-49ee-b457-5a5f34f71510');
    expect(agent.scanner?.name).toEqual('Agent1');
  });

  test('should parse latest_agent_version', () => {
    const agent = Agent.fromElement({latest_agent_version: 'v1'});
    expect(agent.latestAgentVersion).toEqual('v1');
  });

  test('should parse latest_updater_version', () => {
    const agent = Agent.fromElement({latest_updater_version: 'v1'});
    expect(agent.latestUpdaterVersion).toEqual('v1');
  });

  test('should parse config', () => {
    const agent = Agent.fromElement({
      config: {
        heartbeat: {
          interval_in_seconds: 300,
          miss_until_inactive: 100,
        },
        agent_control: {
          retry: {
            attempts: 5,
            delay_in_seconds: 10,
            max_jitter_in_seconds: 3,
          },
        },
        agent_script_executor: {
          bulk_size: 20,
          bulk_throttle_time_in_ms: 200,
          indexer_dir_depth: 4,
          period_in_seconds: 600,
          scheduler_cron_time: {
            item: '0 0 * * *',
          },
        },
      },
    });

    expect(agent.config?.agentControl?.retry.attempts).toEqual(5);
    expect(agent.config?.agentControl?.retry.delayInSeconds).toEqual(10);
    expect(agent.config?.agentControl?.retry.maxJitterInSeconds).toEqual(3);
    expect(agent.config?.heartbeat?.intervalInSeconds).toEqual(300);
    expect(agent.config?.heartbeat?.missUntilInactive).toEqual(100);
    expect(agent.config?.agentScriptExecutor?.bulkSize).toEqual(20);
    expect(agent.config?.agentScriptExecutor?.bulkThrottleTimeInMs).toEqual(
      200,
    );
    expect(agent.config?.agentScriptExecutor?.indexerDirDepth).toEqual(4);
    expect(agent.config?.agentScriptExecutor?.schedulerCronTimes).toEqual([
      '0 0 * * *',
    ]);
  });

  test('should check if agent is authorized', () => {
    const authorizedAgent = new Agent({authorized: true});
    expect(authorizedAgent.isAuthorized()).toEqual(true);

    const unauthorizedAgent = new Agent({authorized: false});
    expect(unauthorizedAgent.isAuthorized()).toEqual(false);

    const undefinedAgent = new Agent();
    expect(undefinedAgent.isAuthorized()).toEqual(false);
  });

  test('should check if agent should update to latest', () => {
    const updateAgent = new Agent({updateToLatest: true});
    expect(updateAgent.isUpdateToLatest()).toEqual(true);

    const noUpdateAgent = new Agent({updateToLatest: false});
    expect(noUpdateAgent.isUpdateToLatest()).toEqual(false);
  });

  test('should get connection status', () => {
    const connectedAgent = new Agent({connectionStatus: 'connected'});
    expect(connectedAgent.getConnectionStatus()).toEqual('connected');

    const undefinedStatusAgent = new Agent();
    expect(undefinedStatusAgent.getConnectionStatus()).toEqual('unknown');
  });
});
