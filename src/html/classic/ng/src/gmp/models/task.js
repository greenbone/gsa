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

import {
  is_array,
  is_defined,
  is_empty,
  is_string,
  map,
} from '../utils.js';

import {
  parse_int,
  parse_yesno,
  NO_VALUE,
  YES_VALUE,
} from '../parser.js';

import Model from '../model.js';

import Report from './report.js';
import Schedule from './schedule.js';
import Scanner from './scanner.js';

function parse_progress(value) {
  if (!is_defined(value)) {
    return '0';
  }
  if (is_string(value)) {
    return value;
  }
  if (is_defined(value.__text)) {
    return value.__text;
  }
  return '0';
}

function parse_yes(value) {
  return value === 'yes' ? YES_VALUE : NO_VALUE;
}

class Task extends Model {

  static entity_type = 'task';

  isActive() {
    return this.status === 'Running' || this.status === 'Stop Requested' ||
      this.status === 'Delete Requested' ||
      this.status === 'Ultimate Delete Requested' ||
      this.status === 'Resume Requested' || this.status === 'Requested';
  }

  isRunning() {
    return this.status === 'Running';
  }

  isStopped() {
    return this.status === 'Stopped';
  }

  isNew() {
    return this.status === 'New';
  }

  isChangeable() {
    return this.isNew() || this.isAlterable();
  }

  isAlterable() {
    return this.alterable !== NO_VALUE;
  }

  isContainer() {
    return !is_defined(this.target);
  }

  parseProperties(elem) {
    elem = super.parseProperties(elem);
    elem.report_count.total = parse_int(elem.report_count.__text);
    elem.report_count.finished = parse_int(elem.report_count.finished);
    elem.alterable = parse_yesno(elem.alterable);
    elem.result_count = parse_int(elem.result_count);

    let reports = [
      'first_report',
      'last_report',
      'second_last_report',
      'current_report',
    ];

    reports.forEach(name => {
      let report = elem[name];
      if (is_defined(report)) {
        elem[name] = new Report(report.report);
      }
    });

    let models = [
      'config',
      'slave',
      'target',
    ];
    models.forEach(item => {
      let name = item;
      let model = Model;

      let data = elem[name];
      if (is_defined(data) && !is_empty(data._id)) {
        elem[name] = new model(data, name);
      }
      else {
        delete elem[name];
      }
    });

    if (is_defined(elem.alert)) {
      elem.alerts = map(elem.alert, alert => new Model(alert, 'alert'));
      delete elem.alert;
    }

    if (is_defined(elem.scanner) && !is_empty(elem.scanner._id)) {
      elem.scanner = new Scanner(elem.scanner);
    }
    else {
      delete elem.scanner;
    }

    if (is_defined(elem.schedule) && !is_empty(elem.schedule._id)) {
      elem.schedule = new Schedule(elem.schedule);
    }
    else {
      delete elem.schedule;
    }

    elem.schedule_periods = parse_int(elem.schedule_periods);

    elem.progress = parse_progress(elem.progress);

    const prefs = {};

    if (elem.preferences && is_array(elem.preferences.preference)) {
      for (const pref of elem.preferences.preference) {
        switch (pref.scanner_name) {
          case 'in_assets':
            elem.in_assets = parse_yes(pref.value);
            break;
          case 'assets_apply_overrides':
            elem.apply_overrides = parse_yes(pref.value);
            break;
          case 'assets_min_qod':
            elem.min_qod = parse_int(pref.value);
            break;
          case 'auto_delete':
            elem.auto_delete = pref.value === 'keep' ? 'keep' : 'no';
            break;
          case 'auto_delete_data':
            elem.auto_delete_data = pref.value === '0' ?
              5 : parse_int(pref.value);
            break;
          default:
            prefs[pref.scanner_name] = {value: pref.value, name: pref.name};
            break;
        }
      }
    }

    elem.preferences = prefs;

    if (is_defined(elem.average_duration)) {
      elem.average_duration = moment.duration(parse_int(elem.average_duration),
      'seconds');
    }

    return elem;
  }
}

export default Task;

// vim: set ts=2 sw=2 tw=80:
