/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import _ from 'gmp/locale';

import {is_defined, is_array} from '../utils/identity';
import {is_empty} from '../utils/string';
import {map} from '../utils/array';

import {
  parse_int,
  parse_progress,
  parseYesNo,
  parseDuration,
  NO_VALUE,
  YES_VALUE,
} from '../parser.js';

import Model from '../model.js';

import Report from './report.js';
import Schedule from './schedule.js';
import Scanner from './scanner.js';

export const AUTO_DELETE_KEEP = 'keep';
export const AUTO_DELETE_NO = 'no';
export const AUTO_DELETE_DEFAULT_VALUE = 5;

export const TASK_STATUS = {
  running: 'Running',
  stoprequested: 'Stop Requested',
  deleterequested: 'Delete Requested',
  ultimatedeleterequested: 'Ultimate Delete Requested',
  resumerequested: 'Resume Requested',
  requested: 'Requested',
  stopped: 'Stopped',
  new: 'New',
  interrupted: 'Interrupted',
  container: 'Container',
  uploading: 'Uploading',
  done: 'Done',
};

/* eslint-disable quote-props */
const TASK_STATUS_TRANSLATIONS = {
  'Running': _('Running'),
  'Stop Requested': _('Stop Requested'),
  'Delete Requested': _('Delete Requested'),
  'Ultimate Delete Requested': _('Ultimate Delete Requested'),
  'Resume Requested': _('Resume Requested'),
  'Requested': _('Requested'),
  'Stopped': _('Stopped'),
  'New': _('New'),
  'Interrupted': _('Interrupted'),
  'Container': _('Container'),
  'Uploading': _('Uploading'),
  'Done': _('Done'),
};
/* eslint-disable quote-props */

function parse_yes(value) {
  return value === 'yes' ? YES_VALUE : NO_VALUE;
}

export const getTranslatableTaskStatus = status => {
  return TASK_STATUS_TRANSLATIONS[status];
};

class Task extends Model {

  static entity_type = 'task';

  isActive() {
    return this.status === TASK_STATUS.running ||
      this.status === TASK_STATUS.stoprequested ||
      this.status === TASK_STATUS.deleterequested ||
      this.status === TASK_STATUS.ultimatedeleterequested ||
      this.status === TASK_STATUS.resumerequested ||
      this.status === TASK_STATUS.requested;
  }

  isRunning() {
    return this.status === TASK_STATUS.running;
  }

  isStopped() {
    return this.status === TASK_STATUS.stopped;
  }

  isInterrupted() {
    return this.status === TASK_STATUS.interrupted;
  }

  isNew() {
    return this.status === TASK_STATUS.new;
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

  getTranslatableStatus() {
    return getTranslatableTaskStatus(this.status);
  };

  parseProperties(elem) {
    elem = super.parseProperties(elem);

    const {report_count} = elem;

    if (is_defined(report_count)) {
      elem.report_count = {...report_count};
      elem.report_count.total = parse_int(report_count.__text);
      elem.report_count.finished = parse_int(report_count.finished);
    }

    elem.alterable = parseYesNo(elem.alterable);
    elem.result_count = parse_int(elem.result_count);

    const reports = [
      'first_report',
      'last_report',
      'second_last_report',
      'current_report',
    ];

    reports.forEach(name => {
      const report = elem[name];
      if (is_defined(report)) {
        elem[name] = new Report(report.report);
      }
    });

    const models = [
      'config',
      'slave',
      'target',
    ];
    models.forEach(item => {
      const name = item;
      const model = Model;

      const data = elem[name];
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
            elem.auto_delete = pref.value === AUTO_DELETE_KEEP ?
              AUTO_DELETE_KEEP : AUTO_DELETE_NO;
            break;
          case 'auto_delete_data':
            elem.auto_delete_data = pref.value === '0' ?
              AUTO_DELETE_DEFAULT_VALUE : parse_int(pref.value);
            break;
          case 'max_hosts':
          case 'max_checks':
            elem[pref.scanner_name] = parse_int(pref.value);
            break;
          case 'source_iface':
            elem.source_iface = pref.value;
            break;
          default:
            prefs[pref.scanner_name] = {value: pref.value, name: pref.name};
            break;
        }
      }
    }

    elem.preferences = prefs;

    if (is_defined(elem.average_duration)) {
      elem.average_duration = parseDuration(elem.average_duration);
    }

    return elem;
  }
}

export default Task;

// vim: set ts=2 sw=2 tw=80:
