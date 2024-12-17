/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import Model, {parseModelFromElement} from 'gmp/model';
import {
  parseInt,
  parseProgressElement,
  parseYesNo,
  parseYes,
  parseIntoArray,
  parseText,
  parseDuration,
  NO_VALUE,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {normalizeType} from 'gmp/utils/entitytype';
import {isDefined, isArray, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Report from './report';
import Scanner from './scanner';
import Schedule from './schedule';

export const AUTO_DELETE_KEEP = 'keep';
export const AUTO_DELETE_NO = 'no';
export const AUTO_DELETE_KEEP_DEFAULT_VALUE = 5;

export const HOSTS_ORDERING_SEQUENTIAL = 'sequential';
export const HOSTS_ORDERING_RANDOM = 'random';
export const HOSTS_ORDERING_REVERSE = 'reverse';

export const DEFAULT_MAX_CHECKS = 4;
export const DEFAULT_MAX_HOSTS = 20;
export const DEFAULT_MIN_QOD = 70;

export const TASK_STATUS = {
  queued: 'Queued',
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
  uploadinginterrupted: 'Uploading Interrupted',
  processing: 'Processing',
  done: 'Done',
};

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
  Queued: _l('Queued'),
  Processing: _l('Processing'),
  'Uploading Interrupted': _l('Interrupted'),
};

export const getTranslatableTaskStatus = status =>
  `${TASK_STATUS_TRANSLATIONS[status]}`;

export const isActive = status =>
  status === TASK_STATUS.running ||
  status === TASK_STATUS.stoprequested ||
  status === TASK_STATUS.deleterequested ||
  status === TASK_STATUS.ultimatedeleterequested ||
  status === TASK_STATUS.resumerequested ||
  status === TASK_STATUS.requested ||
  status === TASK_STATUS.queued ||
  status === TASK_STATUS.processing;

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

  isQueued() {
    return this.status === TASK_STATUS.queued;
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

  static parseElement(element) {
    const copy = super.parseElement(element);

    const {report_count} = element;

    if (isDefined(report_count)) {
      copy.report_count = {...report_count};
      copy.report_count.total = parseInt(report_count.__text);
      copy.report_count.finished = parseInt(report_count.finished);
    }

    if (isDefined(element.observers)) {
      copy.observers = {};
      if (isString(element.observers) && element.observers.length > 0) {
        copy.observers.user = element.observers.split(' ');
      } else {
        if (isDefined(element.observers.__text)) {
          copy.observers.user = parseText(element.observers).split(' ');
        }
        if (isDefined(element.observers.role)) {
          copy.observers.role = parseIntoArray(element.observers.role);
        }
        if (isDefined(element.observers.group)) {
          copy.observers.group = parseIntoArray(element.observers.group);
        }
      }
    }

    copy.alterable = parseYesNo(element.alterable);
    copy.result_count = parseInt(element.result_count);

    const reports = ['last_report', 'current_report'];

    reports.forEach(name => {
      const report = element[name];
      if (isDefined(report)) {
        copy[name] = Report.fromElement(report.report);
      }
    });

    // slave isn't really an entity type but it has an id
    const models = ['config', 'slave', 'target'];
    models.forEach(item => {
      const name = item;

      const data = element[name];
      if (isDefined(data) && !isEmpty(data._id)) {
        copy[name] = parseModelFromElement(data, normalizeType(name));
      } else {
        delete copy[name];
      }
    });

    if (isDefined(element.alert)) {
      copy.alerts = map(element.alert, alert =>
        parseModelFromElement(alert, 'alert'),
      );
      delete copy.alert;
    }

    if (isDefined(element.scanner) && !isEmpty(element.scanner._id)) {
      copy.scanner = Scanner.fromElement(element.scanner);
    } else {
      delete copy.scanner;
    }

    if (isDefined(element.schedule) && !isEmpty(element.schedule._id)) {
      copy.schedule = Schedule.fromElement(element.schedule);
    } else {
      delete copy.schedule;
    }

    copy.schedule_periods = parseInt(element.schedule_periods);

    copy.progress = parseProgressElement(element.progress);

    const prefs = {};

    if (copy.preferences && isArray(element.preferences.preference)) {
      for (const pref of element.preferences.preference) {
        switch (pref.scanner_name) {
          case 'in_assets':
            copy.in_assets = parseYes(pref.value);
            break;
          case 'assets_apply_overrides':
            copy.apply_overrides = parseYes(pref.value);
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
            const value = parseInt(pref.value);
            copy.auto_delete_data =
              value === 0
                ? AUTO_DELETE_KEEP_DEFAULT_VALUE
                : parseInt(pref.value);
            break;
          case 'max_hosts':
          case 'max_checks':
            copy[pref.scanner_name] = parseInt(pref.value);
            break;
          default:
            prefs[pref.scanner_name] = {value: pref.value, name: pref.name};
            break;
        }
      }
    }

    copy.preferences = prefs;

    if (isDefined(element.average_duration)) {
      copy.average_duration = parseDuration(element.average_duration);
    }

    if (
      copy.hosts_ordering !== HOSTS_ORDERING_RANDOM &&
      copy.hosts_ordering !== HOSTS_ORDERING_REVERSE &&
      copy.hosts_ordering !== HOSTS_ORDERING_SEQUENTIAL
    ) {
      delete copy.hosts_ordering;
    }

    copy.usageType = element.usage_type;

    return copy;
  }
}

export default Task;
