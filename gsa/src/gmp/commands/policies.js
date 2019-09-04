/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/features/object/entries';

import logger from '../log';

import {forEach, map} from '../utils/array';

import Model from '../model';
import registerCommand from '../command';
import {YES_VALUE, NO_VALUE} from '../parser';

import {parseCounts} from '../collection/parser';

import Nvt from '../models/nvt';
import Policy from '../models/policy';

import EntitiesCommand from './entities';
import EntityCommand from './entity';
import {convert, convert_select, convert_preferences} from './scanconfigs';

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

  create({base, name, comment, scanner_id}) {
    const data = {
      cmd: 'create_config',
      base,
      comment,
      name,
      scanner_id,
      usage_type: 'policy',
    };
    log.debug('Creating policy', data);
    return this.action(data);
  }

  save({id, name, comment = '', trend, select, scanner_preference_values}) {
    const data = {
      ...convert(trend, 'trend:'),
      ...convert(
        scanner_preference_values,
        'preference:scanner:scanner:scanner:',
      ),
      ...convert_select(select, 'select:'),

      cmd: 'save_config',
      id,
      comment,
      name,
    };
    log.debug('Saving policy', data);
    return this.action(data);
  }

  savePolicyFamily({policy_name, family_name, id, selected}) {
    const data = {
      ...convert_select(selected, 'nvt:'),
      cmd: 'save_config_family',
      no_redirect: '1',
      id,
      family: family_name,
      name: policy_name,
    };
    log.debug('Saving scanconfigfamily', data);
    return this.httpPost(data);
  }

  editPolicyFamilySettings({id, family_name, policy_name}) {
    return this.httpGet({
      cmd: 'edit_config_family',
      id,
      name: policy_name,
      family: family_name,
    }).then(response => {
      const {data} = response;
      const policy_resp = data.get_config_family_response;
      const settings = {};

      settings.policy = new Model(policy_resp.config, 'policy');

      const nvts = {};
      forEach(policy_resp.get_nvts_response.nvt, nvt => {
        const oid = nvt._oid;
        nvts[oid] = true;
      });

      settings.nvts = map(policy_resp.all.get_nvts_response.nvt, nvt => {
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

  savePolicyNvt({
    policy_name,
    family_name,
    id,
    manual_timeout,
    nvt_name,
    oid,
    preference_values,
    timeout,
  }) {
    const data = {
      ...convert_preferences(preference_values, oid),
      cmd: 'save_config_nvt',
      no_redirect: '1',
      id,
      oid,
      name: policy_name,
      family: family_name,
      timeout,
    };

    data['preference:scanner:0:scanner:timeout.' + oid] = manual_timeout;

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

// vim: set ts=2 sw=2 tw=80:
