/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseSeverity, parseDate, parseText, YesNo} from 'gmp/parser';
import {isDefined, isModelElement} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export type TicketStatus = keyof typeof TICKET_STATUS;

interface TicketElement extends ModelElement {
  assigned_to?: {
    user?: {
      _id?: string;
      name?: string;
    };
  };
  closed_note?: string;
  closed_time?: string;
  fixed_note?: string;
  fixed_time?: string;
  fix_verified_report?: ModelElement;
  fix_verified_time?: string;
  location?: string;
  nvt?: {
    _oid?: string;
  };
  open_note?: string;
  open_time?: string;
  report?: {
    _id?: string;
    timestamp?: string;
  };
  result?: {
    _id?: string;
  };
  severity?: number;
  solution_type?: string;
  status?: TicketStatus;
  task?: {
    _id?: string;
    name?: string;
    trash?: YesNo;
  };
}

interface TicketProperties extends ModelProperties {
  assignedTo?: Model;
  closedNote?: string;
  closedTime?: Date;
  fixedNote?: string;
  fixedTime?: Date;
  fixVerifiedReport?: Model;
  fixVerifiedTime?: Date;
  nvt?: {
    oid?: string;
  };
  openNote?: string;
  openTime?: Date;
  result?: Model;
  report?: Model;
  severity?: number;
  solutionType?: string;
  status?: TicketStatus;
  task?: Model;
}

export const TICKET_STATUS = {
  open: 'Open',
  fixed: 'Fixed',
  verified: 'Fix Verified',
  closed: 'Closed',
} as const;

export const TICKET_STATUS_TRANSLATIONS = {
  [TICKET_STATUS.open]: _l('Open'),
  [TICKET_STATUS.fixed]: _l('Fixed'),
  [TICKET_STATUS.verified]: _l('Fix Verified'),
  [TICKET_STATUS.closed]: _l('Closed'),
} as const;

export const getTranslatableTicketStatus = (status: TicketStatus) =>
  `${TICKET_STATUS_TRANSLATIONS[status]}`;

class Ticket extends Model {
  static readonly entityType = 'ticket';

  readonly assignedTo?: Model;
  readonly closedNote?: string;
  readonly closedTime?: Date;
  readonly fixedNote?: string;
  readonly fixedTime?: Date;
  readonly fixVerifiedReport?: Model;
  readonly fixVerifiedTime?: Date;
  readonly nvt?: {oid?: string};
  readonly openNote?: string;
  readonly openTime?: Date;
  readonly result?: Model;
  readonly report?: Model;
  readonly severity?: number;
  readonly solutionType?: string;
  readonly status?: TicketStatus;
  readonly task?: Model;

  constructor({
    assignedTo,
    closedNote,
    closedTime,
    fixedNote,
    fixedTime,
    fixVerifiedReport,
    fixVerifiedTime,
    nvt,
    openNote,
    openTime,
    result,
    report,
    severity,
    solutionType,
    status,
    task,
    ...properties
  }: TicketProperties = {}) {
    super(properties);

    this.assignedTo = assignedTo;
    this.closedNote = closedNote;
    this.closedTime = closedTime;
    this.fixedNote = fixedNote;
    this.fixedTime = fixedTime;
    this.fixVerifiedReport = fixVerifiedReport;
    this.fixVerifiedTime = fixVerifiedTime;
    this.nvt = nvt;
    this.openNote = openNote;
    this.openTime = openTime;
    this.result = result;
    this.report = report;
    this.severity = severity;
    this.solutionType = solutionType;
    this.status = status;
    this.task = task;
  }

  static fromElement(element?: TicketElement): Ticket {
    return new Ticket(this.parseElement(element));
  }

  static parseElement(element: TicketElement = {}): TicketProperties {
    const ret = super.parseElement(element) as TicketProperties;

    if (isDefined(element.assigned_to) && isDefined(element.assigned_to.user)) {
      ret.assignedTo = Model.fromElement(element.assigned_to.user, 'user');
    }

    if (isModelElement(element.result)) {
      ret.result = Model.fromElement(element.result, 'result');
    } else {
      delete ret.result;
    }

    if (isModelElement(element.report)) {
      ret.report = Model.fromElement(element.report, 'report');
    } else {
      delete ret.report;
    }

    if (isModelElement(element.task)) {
      ret.task = Model.fromElement(element.task, 'task');
    } else {
      delete ret.task;
    }

    if (isModelElement(element.fix_verified_report)) {
      ret.fixVerifiedReport = Model.fromElement(
        element.fix_verified_report,
        'report',
      );
    }

    ret.severity = parseSeverity(element.severity);

    if (isDefined(element.nvt) && !isEmpty(element.nvt._oid)) {
      ret.nvt = {oid: element.nvt._oid};
    }

    if (!isEmpty(element.open_time)) {
      ret.openTime = parseDate(element.open_time);
    }

    if (!isEmpty(element.fix_verified_time)) {
      ret.fixVerifiedTime = parseDate(element.fix_verified_time);
    }

    if (!isEmpty(element.fixed_time)) {
      ret.fixedTime = parseDate(element.fixed_time);
    }

    if (!isEmpty(element.closed_time)) {
      ret.closedTime = parseDate(element.closed_time);
    }

    ret.solutionType = element.solution_type;

    const openNote = parseText(element.open_note);
    if (!isEmpty(openNote)) {
      ret.openNote = openNote;
    }

    const closedNote = parseText(element.closed_note);
    if (!isEmpty(closedNote)) {
      ret.closedNote = closedNote;
    }

    const fixedNote = parseText(element.fixed_note);
    if (!isEmpty(fixedNote)) {
      ret.fixedNote = fixedNote;
    }

    return ret;
  }
}

export default Ticket;
