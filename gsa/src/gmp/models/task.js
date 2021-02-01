/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {_l} from 'gmp/locale/lang';

import {isDefined, isArray, hasValue} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';
import {normalizeType} from 'gmp/utils/entitytype';

import {
  parseInt,
  parseProgressElement,
  parseYesNo,
  parseYes,
  parseDuration,
  NO_VALUE,
} from 'gmp/parser';

import Model, {parseModelFromElement} from 'gmp/model';

import Report from './report';
import Schedule from './schedule';
import Scanner from './scanner';
import Target from './target';
import Alert from './alert';
import ScanConfig from './scanconfig';
import Tag from './tag';

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
  Queued: _l('Queued'),
};
/* eslint-disable quote-props */

export const getTranslatableTaskStatus = status =>
  `${TASK_STATUS_TRANSLATIONS[status]}`;

export const isActive = status =>
  status === TASK_STATUS.running ||
  status === TASK_STATUS.stoprequested ||
  status === TASK_STATUS.deleterequested ||
  status === TASK_STATUS.ultimatedeleterequested ||
  status === TASK_STATUS.resumerequested ||
  status === TASK_STATUS.requested ||
  status === TASK_STATUS.queued;

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
    return !hasValue(this.target);
  }

  getTranslatableStatus() {
    return getTranslatableTaskStatus(this.status);
  }

  static parseObject(object) {
    const copy = super.parseObject(object);
    const {reports} = object;

    copy.alterable = parseYesNo(object.alterable);
    copy.resultCount = parseInt(object.resultCount); // this doesn't exist in selene yet. Need to add.
    const allReports = ['lastReport', 'currentReport'];

    if (hasValue(reports)) {
      copy.reports = {...reports};
      allReports.forEach(name => {
        const report = reports[name];
        if (hasValue(report)) {
          copy.reports[name] = Report.fromObject(report);
        }
      });
    }

    if (hasValue(object.target)) {
      copy.target = Target.fromObject(object.target);
    } else {
      delete copy.target;
    }

    // slave isn't really an entity type but it has an id
    if (isDefined(object.slave)) {
      const data = object.slave;
      if (isDefined(data) && !isEmpty(data._id)) {
        copy.slave = parseModelFromElement(data, 'slave');
      } else {
        delete copy.slave;
      }
    }

    if (hasValue(object.scanConfig)) {
      copy.config = ScanConfig.fromObject(object.scanConfig);
    }

    delete copy.scanConfig;

    if (hasValue(object.alerts)) {
      copy.alerts = map(object.alerts, alert => Alert.fromObject(alert));
    } else {
      delete copy.alerts;
    }

    if (hasValue(object.scanner)) {
      copy.scanner = Scanner.fromElement(object.scanner);
    } else {
      delete copy.scanner;
    }

    if (hasValue(object.schedule)) {
      copy.schedule = Schedule.fromObject(object.schedule);
    } else {
      delete copy.schedule;
    }

    copy.progress = parseProgressElement(object.progress);

    const prefs = {};

    if (copy.preferences && isArray(object.preferences)) {
      for (const pref of object.preferences) {
        switch (pref.name) {
          case 'in_assets':
            copy.inAssets = parseYes(pref.value);
            break;
          case 'assets_apply_overrides':
            copy.applyOverrides = parseYes(pref.value);
            break;
          case 'assets_min_qod':
            copy.minQod = parseInt(pref.value);
            break;
          case 'auto_delete':
            copy.autoDelete =
              pref.value === AUTO_DELETE_KEEP
                ? AUTO_DELETE_KEEP
                : AUTO_DELETE_NO;
            break;
          case 'auto_delete_data':
            copy.autoDeleteData =
              pref.value === '0'
                ? AUTO_DELETE_KEEP_DEFAULT_VALUE
                : parseInt(pref.value);
            break;
          case 'max_hosts':
            copy.maxHosts = parseInt(pref.value);
            delete copy.max_hosts;
            break;
          case 'max_checks':
            copy.maxChecks = parseInt(pref.value);
            delete copy.max_checks;
            break;
          case 'source_iface':
            copy.sourceIface = pref.value; // is this defined in selene?
            delete copy.source_iface;
            break;
          default:
            prefs[pref.name] = {value: pref.value, name: pref.name};
            break;
        }
      }
    }

    copy.preferences = prefs;

    if (isDefined(object.average_duration)) {
      copy.averageDuration = parseDuration(object.average_duration);
    }

    if (hasValue(object.hostsOrdering)) {
      copy.hostsOrdering = object.hostsOrdering.toLowerCase();
    }
    if (
      copy.hostsOrdering !== HOSTS_ORDERING_RANDOM &&
      copy.hostsOrdering !== HOSTS_ORDERING_REVERSE &&
      copy.hostsOrdering !== HOSTS_ORDERING_SEQUENTIAL
    ) {
      delete copy.hostsOrdering;
    }

    if (hasValue(object.userTags)) {
      copy.userTags = object.userTags.tags.map(tag => {
        return Tag.fromObject(tag);
      });
    } else {
      copy.userTags = [];
    }

    return copy;
  }

  static parseElement(element) {
    // Added back for trash rows
    const copy = super.parseElement(element);

    // Trash can page does not have observers field

    if (isDefined(element.owner)) {
      if (isEmpty(element.owner.name)) {
        delete copy.owner;
      } else {
        copy.owner = element.owner?.name;
      }
    }

    copy.reports = {};

    if (isDefined(element.last_report)) {
      copy.reports.lastReport = Report.fromElement(element.last_report.report);
    }

    if (isDefined(element.current_report)) {
      copy.reports.currentReport = Report.fromElement(
        element.current_report.report,
      );
    }

    const {report_count} = element;

    if (isDefined(report_count)) {
      copy.reports.counts = {...report_count};
      copy.reports.counts.total = parseInt(report_count.__text);
      copy.reports.counts.finished = parseInt(report_count.finished);
    }

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
            copy.inAssets = parseYes(pref.value);
            break;
          case 'assets_apply_overrides':
            copy.applyOverrides = parseYes(pref.value);
            break;
          case 'assets_min_qod':
            copy.minQod = parseInt(pref.value);
            break;
          case 'auto_delete':
            copy.autoDelete =
              pref.value === AUTO_DELETE_KEEP
                ? AUTO_DELETE_KEEP
                : AUTO_DELETE_NO;
            break;
          case 'auto_delete_data':
            const value = parseInt(pref.value);
            copy.autoDeleteData =
              value === 0
                ? AUTO_DELETE_KEEP_DEFAULT_VALUE
                : parseInt(pref.value);
            break;
          case 'max_hosts':
            copy.maxHosts = parseInt(pref.value);
            break;
          case 'max_checks':
            copy.maxChecks = parseInt(pref.value);
            break;
          case 'source_iface':
            copy.sourceIface = pref.value;
            break;
          default:
            prefs[pref.scanner_name] = {value: pref.value, name: pref.name};
            break;
        }
      }
    }

    copy.preferences = prefs;

    // no average duration in trash
    if (
      copy.hostsOrdering !== HOSTS_ORDERING_RANDOM &&
      copy.hostsOrdering !== HOSTS_ORDERING_REVERSE &&
      copy.hostsOrdering !== HOSTS_ORDERING_SEQUENTIAL
    ) {
      delete copy.hosts_ordering;
    }

    copy.usageType = element.usage_type;

    return copy;
  }
}

export default Task;

// vim: set ts=2 sw=2 tw=80:
