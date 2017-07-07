/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import moment from 'moment';

import {is_defined, parse_float} from '../utils.js';

import Model from '../model.js';
import {parse_severity} from '../parser.js';

class ReportReport extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);
    let {task, severity} = ret;

    ret.severity = {
      filtered: parse_float(severity.filtered),
      full: parse_float(severity.full),
    };

    ret.severity_class = new Model(ret.severity_class);

    ret.task = new Model(task);
    ret.task.target = new Model(task.target);

    return ret;
  }

}

export class Report extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    ret.report = new ReportReport(ret.report);
    ret.report_format = new Model(ret.report_format);
    ret.task = new Model(ret.task);

    if (is_defined(ret.severity)) {
      ret.severity = parse_severity(ret.severity);
    }

    ret.type = ret._type;
    ret.content_type = ret._content_type;

    ret.scan_start = moment(elem.scan_start);
    ret.timestamp = moment(elem.timestamp);

    return ret;
  }
}

export default Report;

// vim: set ts=2 sw=2 tw=80:
