/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import {type Element} from 'gmp/models/model';
import Nvt from 'gmp/models/nvt';
import ScanConfig, {
  type ScanConfigPreference,
  type ScanConfigElement,
  type ScanConfigTrend,
} from 'gmp/models/scan-config';
import {NO_VALUE, YES_VALUE, type YesNo} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

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

interface PreferenceValues {
  [key: string]: ScanConfigPreference;
}

interface ScanConfigCommandImportParams {
  xml_file: string;
}

interface ScanConfigCommandCreateParams {
  baseScanConfig: string;
  name: string;
  comment?: string;
}

interface ScanConfigCommandSaveParams {
  id: string;
  familyTrend?: ScanConfigTrend;
  name: string;
  comment?: string;
  trend?: Record<string, ScanConfigTrend>;
  select?: Record<string, YesNo>;
  scannerPreferenceValues?: Record<string, string>;
}

interface ScanConfigCommandSaveFamilyParams {
  id: string;
  familyName: string;
  selected: Record<string, YesNo>;
}

interface ScanConfigCommandEditFamilyParams {
  id: string;
  familyName: string;
}

interface NvtPreferenceValue {
  id: number;
  type: string;
  value: string;
}

interface ScanConfigCommandSaveNvtParams {
  id: string;
  timeout?: number;
  oid: string;
  preferenceValues?: Record<string, NvtPreferenceValue>;
}

interface ScanConfigCommandEditNvtSettingsParams {
  id: string;
  oid: string;
}

const log = logger.getLogger('gmp.commands.scanconfigs');

export const convert = (values: {[key: string]: unknown}, prefix: string) => {
  const ret = {};
  for (const [key, value] of Object.entries(values)) {
    ret[prefix + key] = value;
  }
  return ret;
};

export const convertSelect = (
  values: {[key: string]: YesNo},
  prefix: string,
) => {
  const ret = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === YES_VALUE) {
      ret[prefix + key] = value;
    }
  }
  return ret;
};

export const convertPreferences = (
  values: PreferenceValues = {},
  nvtOid: string,
): {[key: string]: string} => {
  const ret = {};
  for (const [prop, data] of Object.entries(values)) {
    const {id, type, value} = data;
    if (isDefined(value)) {
      const typeString = `${nvtOid}:${id}:${type}:${prop}`;
      if (type === 'password') {
        ret['password:' + typeString] = 'yes';
      } else if (type === 'file') {
        ret['file:' + typeString] = 'yes';
      }
      ret['preference:' + typeString] = value;
    }
  }
  return ret;
};

class ScanConfigCommand extends EntityCommand<ScanConfig, ScanConfigElement> {
  constructor(http: Http) {
    super(http, 'config', ScanConfig);
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  import({xml_file}: ScanConfigCommandImportParams) {
    const data = {
      cmd: 'import_config',
      xml_file,
    };
    log.debug('Importing scan config', data);
    return this.httpPostWithTransform(data);
  }

  create({baseScanConfig, name, comment}: ScanConfigCommandCreateParams) {
    const data = {
      cmd: 'create_config',
      base: baseScanConfig,
      comment,
      name,
      usage_type: 'scan',
    };
    log.debug('Creating scan config', data);
    return this.action(data);
  }

  save({
    id,
    name,
    comment = '',
    trend,
    familyTrend,
    select,
    scannerPreferenceValues,
  }: ScanConfigCommandSaveParams) {
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
      trend: familyTrend,
    };
    log.debug('Saving scan config', data);
    return this.action(data);
  }

  saveScanConfigFamily({
    id,
    familyName,
    selected,
  }: ScanConfigCommandSaveFamilyParams) {
    const data = {
      ...convertSelect(selected, 'nvt:'),
      cmd: 'save_config_family',
      id,
      family: familyName,
    };
    log.debug('Saving scan config family', data);
    return this.httpPostWithTransform(data);
  }

  async editScanConfigFamilySettings({
    id,
    familyName,
  }: ScanConfigCommandEditFamilyParams) {
    const get = this.httpGetWithTransform({
      cmd: 'edit_config_family',
      id,
      family: familyName,
    });
    const all = this.httpGetWithTransform({
      cmd: 'edit_config_family_all',
      id,
      family: familyName,
    });
    const [response, responseAll] = await Promise.all([get, all]);
    const {data} = response;
    const dataAll = responseAll.data;
    const configResp = (
      data as {get_config_family_response: ConfigFamilyResponse}
    ).get_config_family_response;
    const configRespAll = (
      dataAll as {get_config_family_response: ConfigFamilyResponse}
    ).get_config_family_response;

    const nvts: Record<string, boolean> = {};
    forEach(configResp.get_nvts_response.nvt, nvt => (nvts[nvt._oid] = true));

    const mappedNvts = map(
      configRespAll.get_nvts_response.nvt,
      (nvt: NvtResponseEntry) => ({
        oid: nvt._oid,
        severity: nvt.cvss_base,
        selected: nvt._oid in nvts ? YES_VALUE : NO_VALUE,
      }),
    );
    return response.setData({nvts: mappedNvts});
  }

  async saveScanConfigNvt({
    id,
    timeout,
    oid,
    preferenceValues,
  }: ScanConfigCommandSaveNvtParams) {
    const data = {
      ...convertPreferences(preferenceValues, oid),
      cmd: 'save_config_nvt',
      id,
      oid,
      timeout: isDefined(timeout) ? 1 : 0,
    };

    data['preference:' + oid + ':0:entry:timeout'] = isDefined(timeout)
      ? timeout
      : '';

    log.debug('Saving scan config nvt', data);
    await this.httpPostWithTransform(data);
  }

  async editScanConfigNvtSettings({
    id,
    oid,
  }: ScanConfigCommandEditNvtSettingsParams) {
    const response = await this.httpGetWithTransform({
      cmd: 'get_config_nvt',
      id,
      oid,
      name: '', // doesn't matter
    });
    const {data} = response;
    const config_resp = data.get_config_nvt_response;
    // @ts-expect-error
    const nvt = Nvt.fromElement(config_resp.get_nvts_response);
    return response.setData(nvt);
  }

  getElementFromRoot(root: Element): ScanConfigElement {
    // @ts-expect-error
    return root.get_config.get_configs_response.config;
  }
}

export default ScanConfigCommand;
