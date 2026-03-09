/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand, {type EntityCommandParams} from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import logger from 'gmp/log';
import {type Element} from 'gmp/models/model';
import Scanner, {
  type ScannerElement,
  type ScannerType,
} from 'gmp/models/scanner';

export interface ScannerCommandCreateParams {
  name: string;
  caCertificate?: File;
  comment?: string;
  credentialId?: string;
  host: string;
  port: number | '';
  type: ScannerType;
}

export interface ScannerCommandSaveParams extends ScannerCommandCreateParams {
  id: string;
}

interface ScannerCommandVerifyParams {
  id: string;
}

export interface ScannerAgentControlConfigParams {
  id: string;
  attempts?: number;
  delayInSeconds?: number;
  maxJitterInSeconds?: number;
  bulkSize?: number;
  bulkThrottleTimeInMs?: number;
  indexerDirDepth?: number;
  schedulerCronTimes?: string[];
  intervalInSeconds?: number;
  missUntilInactive?: number;
  updateToLatest?: number;
}

const log = logger.getLogger('gmp.commands.scanner');

class ScannerCommand extends EntityCommand<Scanner, ScannerElement> {
  constructor(http: Http) {
    super(http, 'scanner', Scanner);
  }

  getElementFromRoot(root: Element): ScannerElement {
    // @ts-expect-error
    return root.get_scanner.get_scanners_response.scanner;
  }

  async get(
    {id}: EntityCommandParams,
    {filter, details, ...options}: {filter?: string; details?: boolean} = {},
  ): Promise<Response<Scanner, XmlMeta>> {
    // Always request details to get agent_control_config_defaults for agent scanners
    // Backend only returns this data for agent scanner types
    const response = await this.httpGetWithTransform(
      {id, filter, details: '1'},
      options,
    );
    return this.transformResponseToModel(response);
  }

  create({
    name,
    caCertificate,
    comment = '',
    credentialId,
    host,
    port,
    type,
  }: ScannerCommandCreateParams) {
    const data = {
      cmd: 'create_scanner',
      ca_pub: caCertificate,
      comment,
      credential_id: credentialId,
      name,
      port,
      scanner_host: host,
      scanner_type: type,
    };
    log.debug('Creating new scanner', data);
    return this.entityAction(data);
  }

  save({
    id,
    name,
    caCertificate,
    comment = '',
    credentialId,
    host,
    port,
    type,
  }: ScannerCommandSaveParams) {
    const data = {
      cmd: 'save_scanner',
      // send empty string if caCertificate is undefined to remove existing CA cert
      ca_pub: caCertificate ?? '',
      comment,
      // send empty string if credentialId is undefined to remove existing credential
      credential_id: credentialId ?? '',
      id,
      name,
      port,
      scanner_host: host,
      scanner_type: type,
    };
    log.debug('Saving scanner', data);
    return this.action(data);
  }

  verify({id}: ScannerCommandVerifyParams) {
    return this.action({
      cmd: 'verify_scanner',
      id,
    });
  }

  modifyAgentControlConfig({
    id,
    attempts,
    delayInSeconds,
    maxJitterInSeconds,
    bulkSize,
    bulkThrottleTimeInMs,
    indexerDirDepth,
    schedulerCronTimes,
    intervalInSeconds,
    missUntilInactive,
    updateToLatest,
  }: ScannerAgentControlConfigParams) {
    const data: Record<string, string | number | string[]> = {
      cmd: 'modify_agent_control_scan_config',
      agent_control_id: id,
    };

    if (attempts !== undefined) {
      data.attempts = attempts;
    }
    if (delayInSeconds !== undefined) {
      data.delay_in_seconds = delayInSeconds;
    }
    if (maxJitterInSeconds !== undefined) {
      data.max_jitter_in_seconds = maxJitterInSeconds;
    }
    if (bulkSize !== undefined) {
      data.bulk_size = bulkSize;
    }
    if (bulkThrottleTimeInMs !== undefined) {
      data.bulk_throttle_time_in_ms = bulkThrottleTimeInMs;
    }
    if (indexerDirDepth !== undefined) {
      data.indexer_dir_depth = indexerDirDepth;
    }
    if (schedulerCronTimes !== undefined && schedulerCronTimes.length > 0) {
      // Join multiple cron times with comma for the API
      data['scheduler_cron_times:'] = schedulerCronTimes.join(',');
    }
    if (intervalInSeconds !== undefined) {
      data.interval_in_seconds = intervalInSeconds;
    }
    if (missUntilInactive !== undefined) {
      data.miss_until_inactive = missUntilInactive;
    }
    if (updateToLatest !== undefined) {
      data.update_to_latest = updateToLatest;
    }

    log.debug('Modifying scanner agent control config', data);
    return this.action(data);
  }
}

export default ScannerCommand;
