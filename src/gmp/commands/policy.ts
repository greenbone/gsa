/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import {
  convert,
  convertSelect,
  convertPreferences,
} from 'gmp/commands/scan-configs';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import {type Element} from 'gmp/models/model';
import Policy from 'gmp/models/policy';
import {
  BASE_SCAN_CONFIG_ID,
  type SCANCONFIG_TREND_DYNAMIC,
  type SCANCONFIG_TREND_STATIC,
} from 'gmp/models/scan-config';
import {YES_VALUE, NO_VALUE, type YesNo} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

type ScanConfigTrend =
  | typeof SCANCONFIG_TREND_DYNAMIC
  | typeof SCANCONFIG_TREND_STATIC;

interface NvtResponseEntry {
  _oid: string;
  cvss_base?: number;
  oid?: string;
  severity?: number;
  selected?: YesNo;
}

interface ConfigFamilyResponse {
  get_nvts_response: {
    nvt: NvtResponseEntry[];
  };
}

export interface PolicyCommandImportParams {
  xml_file: string;
}

export interface PolicyCommandCreateParams {
  name: string;
  comment?: string;
}

export interface PolicyCommandSaveParams {
  id: string;
  name: string;
  comment?: string;
  trend?: Record<string, ScanConfigTrend>;
  select?: Record<string, YesNo>;
  scannerPreferenceValues?: Record<string, string>;
}

export interface PolicyCommandSaveFamilyParams {
  id: string;
  familyName: string;
  selected: Record<string, YesNo>;
}

export interface PolicyCommandEditFamilyParams {
  id: string;
  familyName: string;
}

interface NvtPreferenceValue {
  id: number;
  type: string;
  value: string;
}

export interface PolicyCommandSaveNvtParams {
  id: string;
  timeout?: number;
  oid: string;
  preferenceValues?: Record<string, NvtPreferenceValue>;
}

const log = logger.getLogger('gmp.commands.policy');

class PolicyCommand extends EntityCommand<Policy> {
  constructor(http: Http) {
    super(http, 'config', Policy);
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  async import({xml_file}: PolicyCommandImportParams) {
    const data = {
      cmd: 'import_config',
      xml_file,
    };
    log.debug('Importing policy', data);
    return await this.httpPostWithTransform(data);
  }

  async create({name, comment}: PolicyCommandCreateParams) {
    const data = {
      cmd: 'create_config',
      base: BASE_SCAN_CONFIG_ID,
      comment,
      name,
      usage_type: 'policy',
    };
    log.debug('Creating policy', data);
    return await this.action(data);
  }

  async save({
    id,
    name,
    comment = '',
    trend,
    select,
    scannerPreferenceValues,
  }: PolicyCommandSaveParams) {
    const trendData = isDefined(trend) ? convert(trend, 'trend:') : {};
    const scannerPreferenceData = isDefined(scannerPreferenceValues)
      ? convert(scannerPreferenceValues, 'preference:scanner:scanner:scanner:')
      : {};

    const selectData = isDefined(select)
      ? convertSelect(select, 'select:')
      : {};

    const data = {
      ...trendData,
      ...scannerPreferenceData,
      ...selectData,
      cmd: 'save_config',
      id,
      comment,
      name,
    };

    log.debug('Saving policy', data);
    return await this.action(data);
  }

  async savePolicyFamily({
    id,
    familyName,
    selected,
  }: PolicyCommandSaveFamilyParams) {
    const data = {
      ...convertSelect(selected, 'nvt:'),
      cmd: 'save_config_family',
      id,
      family: familyName,
    };
    log.debug('Saving scan config family', data);
    return await this.httpPostWithTransform(data);
  }

  async editPolicyFamilySettings({
    id,
    familyName,
  }: PolicyCommandEditFamilyParams) {
    const [response, responseAll] = await Promise.all([
      this.httpGetWithTransform({
        cmd: 'edit_config_family',
        id,
        family: familyName,
      }),
      this.httpGetWithTransform({
        cmd: 'edit_config_family_all',
        id,
        family: familyName,
      }),
    ]);

    const {data} = response;
    const dataAll = responseAll.data;
    const policyResp = (
      data as {get_config_family_response: ConfigFamilyResponse}
    ).get_config_family_response;
    const policyRespAll = (
      dataAll as {get_config_family_response: ConfigFamilyResponse}
    ).get_config_family_response;

    const nvts: Record<string, boolean> = {};
    forEach(policyResp.get_nvts_response.nvt, (nvt: NvtResponseEntry) => {
      nvts[nvt._oid] = true;
    });

    const mappedNvts = map(
      policyRespAll.get_nvts_response.nvt,
      (nvt: NvtResponseEntry) => {
        const entry = {
          oid: nvt._oid,
          severity: nvt.cvss_base,
          selected: nvt._oid in nvts ? YES_VALUE : NO_VALUE,
        };
        return entry;
      },
    );

    return response.setData({nvts: mappedNvts});
  }

  async savePolicyNvt({
    id,
    timeout,
    oid,
    preferenceValues,
  }: PolicyCommandSaveNvtParams) {
    const data: Record<string, string | number> = {
      ...convertPreferences(preferenceValues, oid),
      cmd: 'save_config_nvt',
      id,
      oid,
      timeout: isDefined(timeout) ? 1 : 0,
    };

    data['preference:scanner:0:scanner:timeout.' + oid] = isDefined(timeout)
      ? timeout
      : '';

    log.debug('Saving policy nvt', data);
    return await this.httpPostWithTransform(data);
  }

  getElementFromRoot(root: Element) {
    // @ts-expect-error
    return root.get_config.get_configs_response.config;
  }
}

export default PolicyCommand;
