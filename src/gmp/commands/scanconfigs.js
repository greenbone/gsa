/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import logger from 'gmp/log';
import Nvt from 'gmp/models/nvt';
import ScanConfig from 'gmp/models/scanconfig';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.scanconfigs');

export const convert = (values, prefix) => {
  const ret = {};
  for (const [key, value] of Object.entries(values)) {
    ret[prefix + key] = value;
  }
  return ret;
};

export const convertSelect = (values, prefix) => {
  const ret = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === YES_VALUE) {
      ret[prefix + key] = value;
    }
  }
  return ret;
};

export const convertPreferences = (values = {}, nvtOid) => {
  const ret = {};
  for (const [prop, data] of Object.entries(values)) {
    const {id, type, value} = data;
    if (isDefined(value)) {
      const typestring = nvtOid + ':' + id + ':' + type + ':' + prop;
      if (type === 'password') {
        ret['password:' + typestring] = 'yes';
      } else if (type === 'file') {
        ret['file:' + typestring] = 'yes';
      }
      ret['preference:' + typestring] = value;
    }
  }
  return ret;
};

export class ScanConfigCommand extends EntityCommand {
  constructor(http) {
    super(http, 'config', ScanConfig);
  }

  import({xml_file}) {
    const data = {
      cmd: 'import_config',
      xml_file,
    };
    log.debug('Importing scan config', data);
    return this.httpPost(data);
  }

  create({baseScanConfig, name, comment}) {
    const data = {
      cmd: 'create_config',
      base: baseScanConfig,
      comment,
      name,
      usage_type: 'scan',
    };
    log.debug('Creating scanconfig', data);
    return this.action(data);
  }

  save({id, name, comment = '', trend, select, scannerPreferenceValues}) {
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
    log.debug('Saving scanconfig', data);
    return this.action(data);
  }

  saveScanConfigFamily({id, familyName, selected}) {
    const data = {
      ...convertSelect(selected, 'nvt:'),
      cmd: 'save_config_family',
      id,
      family: familyName,
    };
    log.debug('Saving scanconfigfamily', data);
    return this.httpPost(data);
  }

  editScanConfigFamilySettings({id, familyName}) {
    const get = this.httpGet({
      cmd: 'edit_config_family',
      id,
      family: familyName,
    });
    const all = this.httpGet({
      cmd: 'edit_config_family_all',
      id,
      family: familyName,
    });
    return Promise.all([get, all]).then(([response, response_all]) => {
      const {data} = response;
      const data_all = response_all.data;
      const config_resp = data.get_config_family_response;
      const config_resp_all = data_all.get_config_family_response;
      const settings = {};

      const nvts = {};
      forEach(config_resp.get_nvts_response.nvt, nvt => {
        const oid = nvt._oid;
        nvts[oid] = true;
      });

      settings.nvts = map(config_resp_all.get_nvts_response.nvt, nvt => {
        nvt.oid = nvt._oid;
        delete nvt._oid;

        nvt.severity = nvt.cvss_base;
        delete nvt.cvss_base;

        nvt.selected = nvt.oid in nvts ? YES_VALUE : NO_VALUE;
        return nvt;
      });

      return response.setData(settings);
    });
  }

  saveScanConfigNvt({id, timeout, oid, preferenceValues}) {
    const data = {
      ...convertPreferences(preferenceValues, oid),
      cmd: 'save_config_nvt',
      id,
      oid,
      timeout: isDefined(timeout) ? 1 : 0,
    };

    data['preference:scanner:0:scanner:timeout.' + oid] = isDefined(timeout)
      ? timeout
      : '';

    log.debug('Saving scanconfignvt', data);
    return this.httpPost(data);
  }

  editScanConfigNvtSettings({id, oid}) {
    return this.httpGet({
      cmd: 'get_config_nvt',
      id,
      oid,
      name: '', // don't matter
    }).then(response => {
      const {data} = response;
      const config_resp = data.get_config_nvt_response;

      const nvt = Nvt.fromElement(config_resp.get_nvts_response.nvt);

      return response.setData(nvt);
    });
  }

  getElementFromRoot(root) {
    return root.get_config.get_configs_response.config;
  }
}

class ScanConfigsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'config', ScanConfig);
  }

  getEntitiesResponse(root) {
    return root.get_configs.get_configs_response;
  }

  get(params, options) {
    params = {...params, usage_type: 'scan'};
    return this.httpGet(params, options).then(response => {
      const {entities, filter, counts} = this.getCollectionListFromRoot(
        response.data,
      );
      return response.set(entities, {filter, counts});
    });
  }
}

registerCommand('scanconfig', ScanConfigCommand);
registerCommand('scanconfigs', ScanConfigsCommand);
