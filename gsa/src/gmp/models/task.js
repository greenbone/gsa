/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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

import {isDefined, isArray, hasValue} from '../utils/identity';
import {isEmpty} from '../utils/string';
import {map} from '../utils/array';

import {
  parseInt,
  parseProgressElement,
  parseYesNo,
  parseDuration,
  NO_VALUE,
  YES_VALUE,
} from '../parser';

import Model, {parseModelFromElement} from '../model';

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

export function parse_yes(value) {
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
    return !hasValue(this.target);
  }

  getTranslatableStatus() {
    return getTranslatableTaskStatus(this.status);
  }

  static parseObject(object) {
    const copy = super.parseObject(object);

    const {reportCount} = object;

    if (isDefined(reportCount)) {
      copy.reportCount = {...reportCount};
      copy.reportCount.total = parseInt(reportCount.total);
      copy.reportCount.finished = parseInt(reportCount.finished);
    }

    copy.alterable = parseYesNo(object.alterable);
    copy.resultCount = parseInt(object.resultCount); // this doesn't exist in selene yet. Need to add.
    const reports = ['lastReport', 'currentReport'];

    reports.forEach(name => {
      const report = object[name];
      if (hasValue(report)) {
        copy[name] = Report.fromObject(report);
      }
    });

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
            copy.inAssets = parse_yes(pref.value);
            break;
          case 'assets_apply_overrides':
            copy.applyOverrides = parse_yes(pref.value);
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

    copy.usageType = object.usage_type;

    if (hasValue(object.userTags)) {
      copy.userTags = object.userTags.tags.map(tag => {
        return Tag.fromObject(tag);
      });
    } else {
      copy.userTags = [];
    }

    return copy;
  }
}

export default Task;

// vim: set ts=2 sw=2 tw=80:
