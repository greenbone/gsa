/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {forEach, map} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Model, {parseModelFromElement} from 'gmp/model';
import {parseSeverity, parseQod} from 'gmp/parser';

import Nvt from './nvt';

import Note from './note';

import Override from './override';
import Cve from './cve';

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
      compliance,
      description,
      detection,
      host = {},
      name,
      notes,
      nvt: information = {},
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

    if (information.type === 'nvt') {
      copy.information = Nvt.fromElement(information);
    } else {
      copy.information = Cve.fromResultElement(information);
      copy.name = isDefined(copy.name) ? copy.name : information.name;
    }

    delete copy.nvt;

    if (isDefined(description)) {
      copy.description = description;
    }

    if (isDefined(compliance)) {
      copy.compliance = compliance;
    }

    if (isDefined(severity)) {
      copy.severity = parseSeverity(severity);
    }

    copy.vulnerability = isDefined(name) ? name : information._oid;

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
