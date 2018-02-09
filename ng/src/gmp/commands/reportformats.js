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

import {is_defined} from '../utils/identity';

import PromiseFactory from '../promise.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import ReportFormat from '../models/reportformat.js';

const log = logger.getLogger('gmp.commands.reportformats');

class ReportFormatCommand extends EntityCommand {

  constructor(http) {
    super(http, 'report_format', ReportFormat);
  }

  import({xml_file}) {
    const data = {
      cmd: 'import_report_format',
      xml_file,
    };
    log.debug('Importing report format', data);
    return this.httpPost(data);
  }

  save(args) {
    const {
      active,
      id,
      id_lists = {},
      name,
      preferences = {},
      summary,
    } = args;

    const data = {
      cmd: 'save_report_format',
      enable: active,
      id,
      name,
      summary,
    };
    for (const prefname in preferences) {
      const prefix = 'preference:nvt[string]:'; // only the format of the prefix is important
      data[prefix + prefname] = preferences[prefname];
    }

    const id_list = [];
    for (const lname in id_lists) {
      data['include_id_list:' + lname] = 1;
      for (const val of id_lists[lname]) {
        id_list.push(lname + ':' + val);
      }
    }
    data['id_list:'] = id_list;

    log.debug('Saving report format', args, data);
    return this.action(data);
  }

  verify({id}) {
    log.debug('Verifying report format', id);
    return this.httpPost({
      cmd: 'verify_report_format',
      next: 'get_report_format',
      id,
    }).then(this.transformRequest, rej => {
      const {root} = rej;

      if (is_defined(root) && is_defined(root.get_report_formats) &&
        is_defined(root.get_report_formats.verify_report_format_response)) {
        const response = root.get_report_formats.verify_report_format_response;
        rej.setMessage(response._status_text);
      }

      return PromiseFactory.reject(rej);
    });
  }

  getElementFromRoot(root) {
    return root.get_report_format.get_report_formats_response.report_format;
  }
}

class ReportFormatsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'report_format', ReportFormat);
  }

  getEntitiesResponse(root) {
    return root.get_report_formats.get_report_formats_response;
  }
}

register_command('reportformat', ReportFormatCommand);
register_command('reportformats', ReportFormatsCommand);

// vim: set ts=2 sw=2 tw=80:
