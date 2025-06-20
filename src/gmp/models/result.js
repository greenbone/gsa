/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model from 'gmp/models/model';
import Note from 'gmp/models/note';
import Nvt from 'gmp/models/nvt';
import Override from 'gmp/models/override';
import {parseSeverity, parseQod} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

const createCveResult = ({name, epss}) => {
  return {
    name,
    id: name,
    epss: epss,
  };
};

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
      this.result = Model.fromElement(elem.result, 'result');
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
      copy.information = Nvt.fromElement({nvt: information});
    } else {
      copy.information = createCveResult(information);
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
      copy.report = Model.fromElement(report, 'report');
    }

    if (isDefined(task)) {
      copy.task = Model.fromElement(task, 'task');
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
      ? map(tickets.ticket, ticket => Model.fromElement(ticket, 'ticket'))
      : [];

    return copy;
  }

  hasDelta() {
    return isDefined(this.delta);
  }
}

export default Result;
