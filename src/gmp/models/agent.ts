/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date as GmpDate} from 'gmp/models/date';
import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {
  parseBoolean,
  parseDate,
  parseText,
  parseToString,
  type YesNo,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface AgentScriptExecutorElement {
  bulk_size?: number;
  bulk_throttle_time_in_ms?: number;
  indexer_dir_depth?: number;
  period_in_seconds?: number;
  scheduler_cron_time?: {
    item?: string | string[];
  };
}

interface AgentConfigElement {
  agent_control?: {
    retry?: {
      attempts?: number;
      delay_in_seconds?: number;
      max_jitter_in_seconds?: number;
    };
  };
  agent_script_executor?: AgentScriptExecutorElement;
  heartbeat?: {
    interval_in_seconds?: number;
    miss_until_inactive?: number;
  };
}

export interface AgentElement extends ModelElement {
  hostname?: string;
  agent_id?: string;
  authorized?: YesNo;
  connection_status?: string;
  last_update?: string;
  last_updater_heartbeat?: string;
  updater_version?: string;
  agent_version?: string;
  operating_system?: string;
  architecture?: string;
  update_to_latest?: YesNo;
  schedule?: string;
  scanner?: {
    _id: string;
    name?: string;
  };
  config?: AgentConfigElement;
}

export interface Scanner {
  id: string;
  name?: string;
}

export interface RetryConfig {
  attempts: number;
  delayInSeconds: number;
  maxJitterInSeconds: number;
}

interface AgentScriptExecutorConfig {
  bulkSize: number;
  bulkThrottleTimeInMs: number;
  indexerDirDepth: number;
  schedulerCronTimes?: string[];
}

interface HeartbeatConfig {
  intervalInSeconds: number;
  missUntilInactive: number;
}

interface AgentControlConfig {
  retry: RetryConfig;
}

export interface AgentConfig {
  agentControl: AgentControlConfig;
  agentScriptExecutor: AgentScriptExecutorConfig;
  heartbeat: HeartbeatConfig;
}

interface AgentProperties extends ModelProperties {
  hostname?: string;
  agentId?: string;
  authorized?: boolean;
  connectionStatus?: string;
  lastUpdate?: GmpDate;
  lastUpdaterHeartbeat?: GmpDate;
  updaterVersion?: string;
  agentVersion?: string;
  operatingSystem?: string;
  architecture?: string;
  updateToLatest?: boolean;
  schedule?: string;
  scanner?: Scanner;
  config?: AgentConfig;
}

const parseAgentScriptExecutor = (
  agentScriptExecutor?: AgentScriptExecutorElement,
): AgentScriptExecutorConfig => {
  if (!isDefined(agentScriptExecutor)) {
    return {
      bulkSize: 0,
      bulkThrottleTimeInMs: 0,
      indexerDirDepth: 0,
      schedulerCronTimes: [],
    };
  }
  return {
    bulkSize: agentScriptExecutor?.bulk_size ?? 0,
    bulkThrottleTimeInMs: agentScriptExecutor?.bulk_throttle_time_in_ms ?? 0,
    indexerDirDepth: agentScriptExecutor?.indexer_dir_depth ?? 0,
    schedulerCronTimes: map(
      agentScriptExecutor?.scheduler_cron_time?.item,
      item => parseToString(item),
    ).filter(isDefined),
  };
};

class Agent extends Model {
  static readonly entityType = 'agent';

  readonly hostname?: string;
  readonly agentId?: string;
  readonly authorized?: boolean;
  readonly connectionStatus?: string;
  readonly lastUpdate?: GmpDate;
  readonly lastUpdaterHeartbeat?: GmpDate;
  readonly updaterVersion?: string;
  readonly agentVersion?: string;
  readonly operatingSystem?: string;
  readonly architecture?: string;
  readonly updateToLatest?: boolean;
  readonly schedule?: string;
  readonly scanner?: Scanner;
  readonly config?: AgentConfig;

  constructor({
    hostname,
    agentId,
    authorized,
    connectionStatus,
    lastUpdate,
    lastUpdaterHeartbeat,
    updaterVersion,
    agentVersion,
    operatingSystem,
    architecture,
    updateToLatest,
    schedule,
    scanner,
    config,
    ...properties
  }: AgentProperties = {}) {
    super(properties);

    this.hostname = hostname;
    this.agentId = agentId;
    this.authorized = authorized;
    this.connectionStatus = connectionStatus;
    this.lastUpdate = lastUpdate;
    this.lastUpdaterHeartbeat = lastUpdaterHeartbeat;
    this.updaterVersion = updaterVersion;
    this.agentVersion = agentVersion;
    this.operatingSystem = operatingSystem;
    this.architecture = architecture;
    this.updateToLatest = updateToLatest;
    this.schedule = schedule;
    this.scanner = scanner;
    this.config = config;
  }

  static fromElement(element: AgentElement = {}): Agent {
    const props = this.parseElement(element);
    return new Agent(props);
  }

  static parseElement(element: AgentElement = {}): AgentProperties {
    const copy = super.parseElement(element) as AgentProperties;

    const {scanner, config} = element;

    copy.hostname = parseToString(element.hostname);
    copy.agentId = parseToString(element.agent_id);
    copy.authorized = parseBoolean(element.authorized);
    copy.connectionStatus = parseToString(element.connection_status);
    copy.lastUpdate = parseDate(element.last_update);
    copy.lastUpdaterHeartbeat = parseDate(element.last_updater_heartbeat);
    copy.updaterVersion = parseToString(element.updater_version);
    copy.agentVersion = parseToString(element.agent_version);
    copy.operatingSystem = parseToString(element.operating_system);
    copy.architecture = parseToString(element.architecture);
    copy.updateToLatest = parseBoolean(element.update_to_latest);
    copy.schedule = parseText(element.schedule);

    copy.scanner = isDefined(scanner)
      ? {
          id: scanner._id,
          name: parseToString(scanner.name),
        }
      : undefined;

    if (isDefined(config)) {
      const {
        heartbeat,
        agent_control: agentControl,
        agent_script_executor: agentScriptExecutor,
      } = config;

      copy.config = {
        agentControl: {
          retry: {
            attempts: agentControl?.retry?.attempts ?? 0,
            delayInSeconds: agentControl?.retry?.delay_in_seconds ?? 0,
            maxJitterInSeconds:
              config.agent_control?.retry?.max_jitter_in_seconds ?? 0,
          },
        },
        agentScriptExecutor: parseAgentScriptExecutor(agentScriptExecutor),
        heartbeat: {
          intervalInSeconds: heartbeat?.interval_in_seconds ?? 0,
          missUntilInactive: heartbeat?.miss_until_inactive ?? 0,
        },
      };
    }

    return copy;
  }

  isAuthorized(): boolean {
    return Boolean(this.authorized);
  }

  isUpdateToLatest(): boolean {
    return Boolean(this.updateToLatest);
  }

  getConnectionStatus(): string {
    return this.connectionStatus || 'unknown';
  }
}

export default Agent;
