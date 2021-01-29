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

import {forEach, map} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Model, {parseModelFromElement} from 'gmp/model';
import {parseSeverity, parseQod} from 'gmp/parser';

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
      this.result = parseModelFromElement(elem.result, 'result');
    }
  }
}

class Result extends Model {
  static entityType = 'result';

  static parseElement(element) {
    const copy = super.parseElement(element);

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
    } = element;

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

    copy.nvt = Nvt.fromElement(nvt);

    if (isDefined(description)) {
      copy.description = description;
    }

    if (isDefined(severity)) {
      copy.severity = parseSeverity(severity);
    }

    copy.vulnerability = isDefined(name) ? name : nvt._oid;

    if (isDefined(report)) {
      copy.report = parseModelFromElement(report, 'report');
    }

    if (isDefined(task)) {
      copy.task = parseModelFromElement(task, 'task');
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
      ? map(notes.note, note => Note.fromElement(note))
      : [];
    copy.overrides = isDefined(overrides)
      ? map(overrides.override, override => Override.fromElement(override))
      : [];

    // parse tickets as models only. we don't have other data then the id here
    copy.tickets = isDefined(tickets)
      ? map(tickets.ticket, ticket => parseModelFromElement(ticket, 'ticket'))
      : [];

    return copy;
  }

  hasDelta() {
    return isDefined(this.delta);
  }
}

export default Result;

// vim: set ts=2 sw=2 tw=80:
