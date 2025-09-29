/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Date as GmpDate} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseDate, parseText, parseYesNo, YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export interface Scanner {
  id: string;
  name?: string;
}

export interface RetryConfig {
  attempts: number;
  delay_in_seconds: number;
  max_jitter_in_seconds: number;
}

export interface AgentScriptExecutorConfig {
  bulk_size: number;
  bulk_throttle_time_in_ms: number;
  indexer_dir_depth: number;
  period_in_seconds: number;
  scheduler_cron_time: string;
  scheduler_cron_times?: string[];
}

export interface HeartbeatConfig {
  interval_in_seconds: number;
  miss_until_inactive: number;
}

export interface AgentControlConfig {
  retry: RetryConfig;
}

export interface AgentConfig {
  agent_control: AgentControlConfig;
  agent_script_executor: AgentScriptExecutorConfig;
  heartbeat: HeartbeatConfig;
}

export interface AgentElement extends ModelElement {
  hostname?: string;
  agent_id?: string;
  agentId?: string;
  authorized?: YesNo;
  connection_status?: string;
  connectionStatus?: string;
  last_update?: string;
  lastUpdate?: string | GmpDate;
  last_updater_heartbeat?: string;
  lastUpdaterHeartbeat?: string | GmpDate;
  updater_version?: string;
  updaterVersion?: string;
  agent_version?: string;
  agentVersion?: string;
  operating_system?: string;
  operatingSystem?: string;
  architecture?: string;
  update_to_latest?: YesNo;
  updateToLatest?: YesNo;
  schedule?: string;
  scanner?: {
    _id?: string;
    id?: string;
    name?: string;
  };
  config?: {
    agent_control?: {
      retry?: {
        attempts?: number;
        delay_in_seconds?: number;
        max_jitter_in_seconds?: number;
      };
    };
    agent_script_executor?: {
      bulk_size?: number;
      bulk_throttle_time_in_ms?: number;
      indexer_dir_depth?: number;
      period_in_seconds?: number;
      scheduler_cron_time?:
        | string
        | {cron?: string | string[]; item?: string | string[]};
    };
    heartbeat?: {
      interval_in_seconds?: number;
      miss_until_inactive?: number;
    };
  };
}

interface AgentProperties extends ModelProperties {
  hostname?: string;
  agentId?: string;
  authorized?: YesNo;
  connectionStatus?: string;
  lastUpdate?: GmpDate;
  lastUpdaterHeartbeat?: GmpDate;
  updaterVersion?: string;
  agentVersion?: string;
  operatingSystem?: string;
  architecture?: string;
  updateToLatest?: YesNo;
  schedule?: string;
  scanner?: Scanner;
  config?: AgentConfig;
}

// @ts-ignore
class Agent extends Model {
  static readonly entityType = 'agent';

  readonly hostname?: string;
  readonly agentId?: string;
  readonly authorized?: YesNo;
  readonly connectionStatus?: string;
  readonly lastUpdate?: GmpDate;
  readonly lastUpdaterHeartbeat?: GmpDate;
  readonly updaterVersion?: string;
  readonly agentVersion?: string;
  readonly operatingSystem?: string;
  readonly architecture?: string;
  readonly updateToLatest?: YesNo;
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

    const {
      hostname,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      agent_id,
      agentId,
      authorized,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      connection_status,
      connectionStatus,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      last_update,
      lastUpdate,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      last_updater_heartbeat,
      lastUpdaterHeartbeat,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      updater_version,
      updaterVersion,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      agent_version,
      agentVersion,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      operating_system,
      operatingSystem,
      architecture,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      update_to_latest,
      updateToLatest,
      schedule,
      scanner,
      config,
    } = element;

    copy.hostname = parseText(hostname);
    // Prefer snake_case (from API), fallback to camelCase (for reprocessing)
    copy.agentId = parseText(agent_id || agentId);
    copy.authorized = parseYesNo(authorized);
    copy.connectionStatus = parseText(connection_status || connectionStatus);

    const lastUpdateValue = last_update || lastUpdate;
    copy.lastUpdate = isDefined(lastUpdateValue)
      ? typeof lastUpdateValue === 'string'
        ? parseDate(lastUpdateValue)
        : lastUpdateValue
      : undefined;

    const lastHeartbeatValue = last_updater_heartbeat || lastUpdaterHeartbeat;
    copy.lastUpdaterHeartbeat = isDefined(lastHeartbeatValue)
      ? typeof lastHeartbeatValue === 'string'
        ? parseDate(lastHeartbeatValue)
        : lastHeartbeatValue
      : undefined;

    copy.updaterVersion = parseText(updater_version || updaterVersion);
    copy.agentVersion = parseText(agent_version || agentVersion);
    copy.operatingSystem = parseText(operating_system || operatingSystem);
    copy.architecture = parseText(architecture);
    copy.updateToLatest = parseYesNo(update_to_latest || updateToLatest);
    copy.schedule = parseText(schedule);

    copy.scanner = isDefined(scanner)
      ? {
          id: scanner._id || scanner.id || '',
          name: parseText(scanner.name),
        }
      : undefined;

    copy.config = isDefined(config)
      ? {
          agent_control: {
            retry: {
              attempts: config.agent_control?.retry?.attempts || 0,
              delay_in_seconds:
                config.agent_control?.retry?.delay_in_seconds || 0,
              max_jitter_in_seconds:
                config.agent_control?.retry?.max_jitter_in_seconds || 0,
            },
          },
          agent_script_executor: {
            bulk_size: config.agent_script_executor?.bulk_size || 0,
            bulk_throttle_time_in_ms:
              config.agent_script_executor?.bulk_throttle_time_in_ms || 0,
            indexer_dir_depth:
              config.agent_script_executor?.indexer_dir_depth || 0,
            period_in_seconds:
              config.agent_script_executor?.period_in_seconds || 0,
            ...(() => {
              const existingCronTimes = (
                config.agent_script_executor as
                  | AgentScriptExecutorConfig
                  | undefined
              )?.scheduler_cron_times;
              if (
                Array.isArray(existingCronTimes) &&
                existingCronTimes.length > 0
              ) {
                return {
                  scheduler_cron_time: existingCronTimes[0],
                  scheduler_cron_times: existingCronTimes,
                };
              }

              const cronValue =
                config.agent_script_executor?.scheduler_cron_time;

              let allCronTimes: string[] = [];

              if (typeof cronValue === 'string') {
                allCronTimes = [cronValue];
              } else if (typeof cronValue === 'object' && cronValue) {
                if (Array.isArray(cronValue.item)) {
                  allCronTimes = cronValue.item
                    .map(item => parseText(item) || '')
                    .filter(item => item !== '');
                } else if (
                  cronValue.item &&
                  typeof cronValue.item === 'string'
                ) {
                  const parsed = parseText(cronValue.item) || '';
                  allCronTimes = parsed !== '' ? [parsed] : [];
                } else if (cronValue.cron) {
                  if (typeof cronValue.cron === 'string') {
                    const parsed = parseText(cronValue.cron) || '';
                    allCronTimes = parsed !== '' ? [parsed] : [];
                  } else if (Array.isArray(cronValue.cron)) {
                    allCronTimes = cronValue.cron
                      .map(item => parseText(item) || '')
                      .filter(item => item !== '');
                  }
                }
              }

              return {
                scheduler_cron_time:
                  allCronTimes.length > 0 ? allCronTimes[0] : '',
                scheduler_cron_times: allCronTimes,
              };
            })(),
          },
          heartbeat: {
            interval_in_seconds: config.heartbeat?.interval_in_seconds || 0,
            miss_until_inactive: config.heartbeat?.miss_until_inactive || 0,
          },
        }
      : undefined;

    return copy;
  }

  isAuthorized(): boolean {
    return this.authorized === 1;
  }

  isUpdateToLatest(): boolean {
    return this.updateToLatest === 1;
  }

  getConnectionStatus(): string {
    return this.connectionStatus || 'unknown';
  }
}

// @ts-ignore
export default Agent;
