/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import logger from '../log.js';
import {for_each, map} from '../utils/array';
import {is_defined} from '../utils/identity';

import Model from '../model.js';
import {EntitiesCommand, EntityCommand, register_command} from '../command.js';
import {YES_VALUE, NO_VALUE} from '../parser.js';

import {parse_counts} from '../collection/parser.js';

import Nvt from '../models/nvt.js';
import ScanConfig, {parse_count} from '../models/scanconfig.js';

const log = logger.getLogger('gmp.commands.scanconfigs');

const convert = (values, prefix) => {
  const ret = {};
  for (const [key, value] of Object.entries(values)) {
    ret[prefix + key] = value;
  }
  return ret;
};

const convert_select = (values, prefix) => {
  const ret = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === YES_VALUE) {
      ret[prefix + key] = value;
    }
  }
  return ret;
};

const convert_preferences = (values, nvt_name) => {
  const ret = {};
  for (const prop in values) {
    const data = values[prop];
    const {type, value} = data;
    if (is_defined(value)) {
      const typestring = nvt_name + '[' + type + ']:' + prop;
      if (type === 'password') {
        ret['password:' + typestring] = 'yes';
      }
      else if (type === 'file') {
        ret['file:' + typestring] = 'yes';
      }
      ret['preference:' + typestring] = value;
    }
  }
  return ret;
};

class ScanConfigCommand extends EntityCommand {

  constructor(http) {
    super(http, 'config', ScanConfig);
  }

  import({xml_file}) {
    const data = {
      cmd: 'import_config',
      next: 'get_config',
      xml_file,
    };
    log.debug('Importing scan config', data);
    return this.httpPost(data);
  }

  create({
    base,
    name,
    comment,
    scanner_id,
  }) {
    const data = {
      cmd: 'create_config',
      next: 'get_config',
      base,
      comment,
      name,
      scanner_id,
    };
    log.debug('Creating scanconfig', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  save({
    id,
    name,
    comment = '',
    trend,
    select,
    scanner_preference_values,
  }) {
    const data = {
      ...convert(trend, 'trend:'),
      ...convert(scanner_preference_values, 'preference:scanner[scanner]:'),
      ...convert_select(select, 'select:'),

      cmd: 'save_config',
      next: 'get_config',
      id,
      comment,
      name,
    };
    log.debug('Saving scanconfig', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  editScanConfigSettings({id}) { // should be removed in future an splitted into several api calls
    return this.httpGet({
      cmd: 'edit_config',
      id,
    }).then(response => {
      const {data} = response;
      const config_resp = data.get_config_response;
      const settings = {};

      settings.scanconfig = new ScanConfig(
        config_resp.get_configs_response.config);

      settings.families = map(
        config_resp.get_nvt_families_response.families.family,
        family => {
          return {
            name: family.name,
            max: parse_count(family.max_nvt_count),
          };
        });

      return response.setData(settings);
    });
  }

  saveScanConfigFamily({
    config_name,
    family_name,
    id,
    selected,
  }) {
    const data = {
      ...convert_select(selected, 'nvt:'),
      cmd: 'save_config_family',
      no_redirect: '1',
      id,
      family: family_name,
      name: config_name,
    };
    log.debug('Saving scanconfigfamily', data);
    return this.httpPost(data);
  }

  editScanConfigFamilySettings({
    id,
    family_name,
    config_name,
  }) {
    return this.httpGet({
      cmd: 'edit_config_family',
      id,
      name: config_name,
      family: family_name,
    }).then(response => {
      const {data} = response;
      const config_resp = data.get_config_family_response;
      const settings = {};

      settings.config = new Model(config_resp.config, 'config');

      const nvts = {};
      for_each(config_resp.get_nvts_response.nvt, nvt => {
        const oid = nvt._oid;
        nvts[oid] = true;
      });

      settings.nvts = map(config_resp.all.get_nvts_response.nvt, nvt => {
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

  saveScanConfigNvt({
    config_name,
    family_name,
    id,
    manual_timeout,
    nvt_name,
    oid,
    preference_values,
    timeout,
  }) {
    const data = {
      ...convert_preferences(preference_values, nvt_name),
      cmd: 'save_config_nvt',
      no_redirect: '1',
      id,
      oid,
      name: config_name,
      family: family_name,
      timeout,
    };

    data['preference:scanner[scanner]:timeout.' + oid] = manual_timeout;

    log.debug('Saving scanconfignvt', data);
    return this.httpPost(data);
  }

  editScanConfigNvtSettings({
    config_name,
    family_name,
    id,
    oid,
  }) {
    return this.httpGet({
      cmd: 'edit_config_nvt',
      id,
      oid,
      name: config_name,
      family: family_name,
    }).then(response => {
      const {data} = response;
      const settings = {};
      const config_resp = data.get_config_nvt_response;

      settings.config = new Model(config_resp.config, 'config');
      settings.nvt = new Nvt(config_resp.get_nvts_response.nvt);

      settings.nvt.notes_counts = parse_counts(data.get_notes_response, 'note');
      settings.nvt.overrides_counts = parse_counts(data.get_overrides_response,
        'override');

      return response.setData(settings);
    });
  }

  getElementFromRoot(root) {
    return root.get_config_response.get_configs_response.config;
  }

}

class ScanConfigsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'config', ScanConfig);
  }

  getEntitiesResponse(root) {
    return root.get_configs.get_configs_response;
  }
}

register_command('scanconfig', ScanConfigCommand);
register_command('scanconfigs', ScanConfigsCommand);

// vim: set ts=2 sw=2 tw=80:
