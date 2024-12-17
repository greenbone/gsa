/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import logger from 'gmp/log';
import Policy from 'gmp/models/policy';
import {BASE_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import EntitiesCommand from './entities';
import EntityCommand from './entity';
import {convert, convertSelect, convertPreferences} from './scanconfigs';

const log = logger.getLogger('gmp.commands.policies');

export class PolicyCommand extends EntityCommand {
  constructor(http) {
    super(http, 'config', Policy);
  }

  import({xml_file}) {
    const data = {
      cmd: 'import_config',
      xml_file,
    };
    log.debug('Importing policy', data);
    return this.httpPost(data);
  }

  create({name, comment}) {
    const data = {
      cmd: 'create_config',
      base: BASE_SCAN_CONFIG_ID,
      comment,
      name,
      usage_type: 'policy',
    };
    log.debug('Creating policy', data);
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
    log.debug('Saving policy', data);
    return this.action(data);
  }

  savePolicyFamily({id, familyName, selected}) {
    const data = {
      ...convertSelect(selected, 'nvt:'),
      cmd: 'save_config_family',
      id,
      family: familyName,
    };
    log.debug('Saving scanconfigfamily', data);
    return this.httpPost(data);
  }

  editPolicyFamilySettings({id, familyName}) {
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
      const policy_resp = data.get_config_family_response;
      const policy_resp_all = data_all.get_config_family_response;
      const settings = {};

      const nvts = {};
      forEach(policy_resp.get_nvts_response.nvt, nvt => {
        const oid = nvt._oid;
        nvts[oid] = true;
      });

      settings.nvts = map(policy_resp_all.get_nvts_response.nvt, nvt => {
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

  savePolicyNvt({id, timeout, oid, preferenceValues}) {
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

    log.debug('Saving policynvt', data);
    return this.httpPost(data);
  }

  getElementFromRoot(root) {
    return root.get_config.get_configs_response.config;
  }
}

export class PoliciesCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'config', Policy);
  }

  getEntitiesResponse(root) {
    return root.get_configs.get_configs_response;
  }

  get(params, options) {
    params = {...params, usage_type: 'policy'};
    return this.httpGet(params, options).then(response => {
      const {entities, filter, counts} = this.getCollectionListFromRoot(
        response.data,
      );
      return response.set(entities, {filter, counts});
    });
  }
}

registerCommand('policy', PolicyCommand);
registerCommand('policies', PoliciesCommand);
