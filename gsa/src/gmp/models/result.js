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

import {forEach, map} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Model from '../model';
import {parseSeverity, parseQod} from '../parser';

import Nvt from './nvt';

import Note from './note';

import Override from './override';

export class Delta {
  static TYPE_NEW = 'new';
  static TYPE_SAME = 'same';
  static TYPE_CHANGED = 'changed';
  static TYPE_GONE = 'gone';

  constructor(elem) {
    if (isString(elem)) {
      this.delta_type = elem;
    } else {
      this.delta_type = elem.__text;
      this.diff = elem.diff;
      this.result = new Model(elem.result, 'result');
    }
  }
}

class Result extends Model {
  static entityType = 'result';

  parseProperties(elem) {
    const copy = super.parseProperties(elem);

    const {
      description,
      detection,
      host = {},
      name,
      notes,
      nvt = {},
      original_severity,
      overrides,
      report,
      severity,
      task,
      delta,
      qod = {},
      tickets,
    } = elem;

    if (isString(host)) {
      // openvas 8
      copy.host = {
        name: host,
        hostname: '',
      };
    } else {
      copy.host = {
        name: host.__text,
        id:
          isDefined(host.asset) && !isEmpty(host.asset._asset_id)
            ? host.asset._asset_id
            : undefined,
        hostname: isDefined(host.hostname) ? host.hostname : '',
      };
    }

    copy.nvt = new Nvt(nvt);

    if (isDefined(description)) {
      copy.description = description;
    }

    if (isDefined(severity)) {
      copy.severity = parseSeverity(severity);
    }

    copy.vulnerability = isDefined(name) ? name : nvt._oid;

    if (isDefined(report)) {
      copy.report = new Model(report, 'report');
    }

    if (isDefined(task)) {
      copy.task = new Model(task, 'task');
    }

    if (isDefined(detection) && isDefined(detection.result)) {
      const details = {};

      if (isDefined(detection.result.details)) {
        forEach(detection.result.details.detail, detail => {
          details[detail.name] = detail.value;
        });
      }

      copy.detection = {...detection}; // create shallow copy

      copy.detection.result = {
        id: detection.result._id,
        details: details,
      };
    }

    if (isDefined(delta)) {
      copy.delta = new Delta(delta);
    }

    if (isDefined(original_severity)) {
      copy.original_severity = parseSeverity(original_severity);
    }

    copy.qod = parseQod(qod);
    copy.notes = isDefined(notes)
      ? map(notes.note, note => new Note(note))
      : [];
    copy.overrides = isDefined(overrides)
      ? map(overrides.override, override => new Override(override))
      : [];

    // parse tickets as models only. we don't have other data then the id here
    copy.tickets = isDefined(tickets)
      ? map(tickets.ticket, ticket => new Model(ticket, 'ticket'))
      : [];

    return copy;
  }

  hasDelta() {
    return isDefined(this.delta);
  }
}

export default Result;

// vim: set ts=2 sw=2 tw=80:
