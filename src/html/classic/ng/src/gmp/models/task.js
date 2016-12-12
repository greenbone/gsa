/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {is_array, parse_int, map} from '../../utils.js';

import Model from '../model.js';

import Report from './report.js';
import Schedule from './schedule.js';
import Scanner from './scanner.js';

export class Task extends Model {

  isActive() {
    return this.status === 'Running' || this.status === 'Stop Requested' ||
      this.status === 'Delete Requested' ||
      this.status === 'Ultimate Delete Requested' ||
      this.status === 'Resume Requested' || this.status === 'Requested';
  }

  isRunning() {
    return this.status === 'Running';
  }

  isWriteable() {
    return this.writeable !== '0';
  }

  isStopped() {
    return this.status === 'Stopped';
  }

  isNew() {
    return this.status === 'New' || this.alterable !== 0;
  }

  isContainer() {
    return this.id === '';
  }

  isInUse() {
    return this.in_use === '1';
  }

  parseProperties(elem) {
    elem.id = elem._id;
    elem.report_count.total = elem.report_count.__text;
    elem.alterable = parse_int(elem.alterable);

    let reports = [
      'first_report',
      'last_report',
      'second_last_report',
      'current_report',
    ];

    reports.forEach(name => {
      let report = elem[name];
      if (report) {
        elem[name] = new Report(report.report);
      }
    });

    let models = [
      'config',
      ['schedule', Schedule],
      'slave',
      'target',
      ['scanner', Scanner],
    ];
    models.forEach(item => {
      let name = item;
      let model = Model;

      if (is_array(item)) {
        [name, model] = item;
      }
      let data = elem[name];
      if (data) {
        elem[name] = new model(data);
      }
    });

    if (elem.alert) {
      elem.alerts = map(elem.alert, alert => new Model(alert));
      delete elem.alert;
    }

    elem.schedule_periods = parse_int(elem.schedule_periods);

    return elem;
  }
}

export default Task;

// vim: set ts=2 sw=2 tw=80:
