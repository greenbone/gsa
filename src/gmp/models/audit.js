/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import {isDefined, isArray, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';
import {normalizeType} from 'gmp/utils/entitytype';

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

import Model, {parseModelFromElement} from 'gmp/model';

import Report from './report';
import Schedule from './schedule';
import Scanner from './scanner';

import {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_NO,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  HOSTS_ORDERING_RANDOM,
  HOSTS_ORDERING_REVERSE,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
  DEFAULT_MIN_QOD,
  TASK_STATUS as AUDIT_STATUS,
  getTranslatableTaskStatus as getTranslatableAuditStatus,
  isActive,
} from './task';

export {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_NO,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  HOSTS_ORDERING_RANDOM,
  HOSTS_ORDERING_REVERSE,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
  DEFAULT_MIN_QOD,
  AUDIT_STATUS,
  getTranslatableAuditStatus,
  isActive,
};

class Audit extends Model {
  static entityType = 'audit';

  isActive() {
    return isActive(this.status);
  }

  isRunning() {
    return this.status === AUDIT_STATUS.running;
  }

  isQueued() {
    return this.status === AUDIT_STATUS.queued;
  }

  isStopped() {
    return this.status === AUDIT_STATUS.stopped;
  }

  isInterrupted() {
    return this.status === AUDIT_STATUS.interrupted;
  }

  isNew() {
    return this.status === AUDIT_STATUS.new;
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
    return getTranslatableAuditStatus(this.status);
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

    const reports = [
      'first_report',
      'last_report',
      'second_last_report',
      'current_report',
    ];

    reports.forEach(name => {
      const report = element[name];
      if (isDefined(report)) {
        copy[name] = Report.fromElement(report.report);
      }
    });

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

    return copy;
  }
}

export default Audit;

// vim: set ts=2 sw=2 tw=80:
