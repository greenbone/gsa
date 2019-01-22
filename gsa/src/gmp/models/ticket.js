/* Copyright (C) 2019 Greenbone Networks GmbH
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
import {parseSeverity, parseDate} from 'gmp/parser';

import {isDefined, isModelElement} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Model from '../model';

export const TICKET_STATUS = {
  open: 'Open',
  solved: 'Solved',
  closed: 'Closed',
  confimed: 'Confirmed',
  orphaned: 'Orphaned',
};

class Ticket extends Model {

  static entityType = 'ticket';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    if (isDefined(elem.assigned_to) && isDefined(elem.assigned_to.user)) {
      ret.assignedTo = {user: new Model(elem.assigned_to.user, 'user')};
    }
    delete ret.assigned_to;

    if (isModelElement(elem.result)) {
      ret.result = new Model(elem.result, 'result');
    }
    else {
      delete ret.result;
    }

    if (isModelElement(elem.report)) {
      ret.report = new Model(elem.report, 'report');
    }
    else {
      delete ret.report;
    }

    if (isModelElement(elem.task)) {
      ret.task = new Model(elem.task, 'task');
    }
    else {
      delete ret.task;
    }

    if (isModelElement(elem.confirmed_report)) {
      ret.confirmedReport = new Model(elem.confirmed_report, 'report');
    }
    delete ret.confirmed_report;

    if (isDefined(elem.severity)) {
      ret.severity = parseSeverity(elem.severity);
    }

    if (isDefined(elem.nvt) && !isEmpty(elem.nvt._oid)) {
      ret.nvt = {oid: elem.nvt._oid};
    }

    if (!isEmpty(elem.open_time)) {
      ret.openTime = parseDate(elem.open_time);
    }
    delete ret.open_time;

    if (!isEmpty(elem.confirmed_time)) {
      ret.confirmedTime = parseDate(elem.confirmed_time);
    }
    delete ret.confirmed_time;

    if (!isEmpty(elem.solved_time)) {
      ret.solvedTime = parseDate(elem.solved_time);
    }
    delete ret.solved_time;

    if (!isEmpty(elem.closed_time)) {
      ret.closedTime = parseDate(elem.closed_time);
    }
    delete ret.closed_time;

    if (!isEmpty(elem.orphaned_time)) {
      ret.orphanedTime = parseDate(elem.orphaned_time);
    }
    delete ret.orphaned_time;

    ret.solutionType = elem.solution_type;
    delete ret.solution_type;

    if (!isEmpty(elem.closed_comment)) {
      ret.closedComment = elem.closed_comment;
    }
    delete ret.closed_comment;

    if (!isEmpty(elem.solved_comment)) {
      ret.solvedComment = elem.solved_comment;
    }
    delete ret.solved_comment;

    return ret;
  }

  isClosed() {
    return this.status === TICKET_STATUS.closed;
  }

  isSolved() {
    return this.status === TICKET_STATUS.solved;
  }

  isConfirmed() {
    return this.status === TICKET_STATUS.confimed;
  }

  isOrphaned() {
    return this.status === TICKET_STATUS.orphaned;
  }
}

export default Ticket;

// vim: set ts=2 sw=2 tw=80:
