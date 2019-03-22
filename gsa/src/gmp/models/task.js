/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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
import {_l} from 'gmp/locale/lang';

import {isDefined, isArray} from '../utils/identity';
import {isEmpty} from '../utils/string';
import {map} from '../utils/array';
import {normalizeType} from '../utils/entitytype';

import {
  parseInt,
  parseProgressElement,
  parseYesNo,
  parseDuration,
  NO_VALUE,
  YES_VALUE,
} from '../parser';

import Model from '../model';

import Report from './report';
import Schedule from './schedule';
import Scanner from './scanner';

export const AUTO_DELETE_KEEP = 'keep';
export const AUTO_DELETE_NO = 'no';
export const AUTO_DELETE_KEEP_DEFAULT_VALUE = 5;

export const HOSTS_ORDERING_SEQUENTIAL = 'sequential';
export const HOSTS_ORDERING_RANDOM = 'random';
export const HOSTS_ORDERING_REVERSE = 'reverse';

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
  Running: _l('Running'),
  'Stop Requested': _l('Stop Requested'),
  'Delete Requested': _l('Delete Requested'),
  'Ultimate Delete Requested': _l('Ultimate Delete Requested'),
  'Resume Requested': _l('Resume Requested'),
  Requested: _l('Requested'),
  Stopped: _l('Stopped'),
  New: _l('New'),
  Interrupted: _l('Interrupted'),
  Container: _l('Container'),
  Uploading: _l('Uploading'),
  Done: _l('Done'),
};
/* eslint-disable quote-props */

function parse_yes(value) {
  return value === 'yes' ? YES_VALUE : NO_VALUE;
}

export const getTranslatableTaskStatus = status =>
  `${TASK_STATUS_TRANSLATIONS[status]}`;

export const isActive = status =>
  status === TASK_STATUS.running ||
  status === TASK_STATUS.stoprequested ||
  status === TASK_STATUS.deleterequested ||
  status === TASK_STATUS.ultimatedeleterequested ||
  status === TASK_STATUS.resumerequested ||
  status === TASK_STATUS.requested;

class Task extends Model {
  static entityType = 'task';

  isActive() {
    return isActive(this.status);
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
    return !isDefined(this.target);
  }

  getTranslatableStatus() {
    return getTranslatableTaskStatus(this.status);
  }

  parseProperties(elem) {
    const copy = super.parseProperties(elem);

    const {report_count} = elem;

    if (isDefined(report_count)) {
      copy.report_count = {...report_count};
      copy.report_count.total = parseInt(report_count.__text);
      copy.report_count.finished = parseInt(report_count.finished);
    }

    copy.alterable = parseYesNo(elem.alterable);
    copy.result_count = parseInt(elem.result_count);

    const reports = [
      'first_report',
      'last_report',
      'second_last_report',
      'current_report',
    ];

    reports.forEach(name => {
      const report = elem[name];
      if (isDefined(report)) {
        copy[name] = new Report(report.report);
      }
    });

    const models = ['config', 'slave', 'target'];
    models.forEach(item => {
      const name = item;

      const data = elem[name];
      if (isDefined(data) && !isEmpty(data._id)) {
        copy[name] = new Model(data, normalizeType(name));
      } else {
        delete copy[name];
      }
    });

    if (isDefined(elem.alert)) {
      copy.alerts = map(elem.alert, alert => new Model(alert, 'alert'));
      delete copy.alert;
    }

    if (isDefined(elem.scanner) && !isEmpty(elem.scanner._id)) {
      copy.scanner = new Scanner(elem.scanner);
    } else {
      delete copy.scanner;
    }

    if (isDefined(elem.schedule) && !isEmpty(elem.schedule._id)) {
      copy.schedule = new Schedule(elem.schedule);
    } else {
      delete copy.schedule;
    }

    copy.schedule_periods = parseInt(elem.schedule_periods);

    copy.progress = parseProgressElement(elem.progress);

    const prefs = {};

    if (copy.preferences && isArray(elem.preferences.preference)) {
      for (const pref of elem.preferences.preference) {
        switch (pref.scanner_name) {
          case 'in_assets':
            copy.in_assets = parse_yes(pref.value);
            break;
          case 'assets_apply_overrides':
            copy.apply_overrides = parse_yes(pref.value);
            break;
          case 'assets_min_qod':
            copy.min_qod = parseInt(pref.value);
            break;
          case 'auto_delete':
            copy.auto_delete =
              pref.value === AUTO_DELETE_KEEP
                ? AUTO_DELETE_KEEP
                : AUTO_DELETE_NO;
            break;
          case 'auto_delete_data':
            copy.auto_delete_data =
              pref.value === '0'
                ? AUTO_DELETE_KEEP_DEFAULT_VALUE
                : parseInt(pref.value);
            break;
          case 'max_hosts':
          case 'max_checks':
            copy[pref.scanner_name] = parseInt(pref.value);
            break;
          case 'source_iface':
            copy.source_iface = pref.value;
            break;
          default:
            prefs[pref.scanner_name] = {value: pref.value, name: pref.name};
            break;
        }
      }
    }

    copy.preferences = prefs;

    if (isDefined(elem.average_duration)) {
      copy.average_duration = parseDuration(elem.average_duration);
    }

    if (
      copy.hosts_ordering !== HOSTS_ORDERING_RANDOM &&
      copy.hosts_ordering !== HOSTS_ORDERING_REVERSE &&
      copy.hosts_ordering !== HOSTS_ORDERING_SEQUENTIAL
    ) {
      delete copy.hosts_ordering;
    }

    return copy;
  }
}

export default Task;

// vim: set ts=2 sw=2 tw=80:
