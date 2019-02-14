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
import {_l} from 'gmp/locale/lang';

import {parseSeverity, parseDate, parseText} from 'gmp/parser';

import {isDefined, isModelElement} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Model from '../model';

export const TICKET_STATUS = {
  open: 'Open',
  fixed: 'Fixed',
  verified: 'Fix Verified',
  closed: 'Closed',
};

export const TICKET_STATUS_TRANSLATIONS = {
  [TICKET_STATUS.open]: _l('Open'),
  [TICKET_STATUS.fixed]: _l('Fixed'),
  [TICKET_STATUS.verified]: _l('Fix Verified'),
  [TICKET_STATUS.closed]: _l('Closed'),
};

export const getTranslatableTicketStatus = status =>
  `${TICKET_STATUS_TRANSLATIONS[status]}`;

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
    } else {
      delete ret.result;
    }

    if (isModelElement(elem.report)) {
      ret.report = new Model(elem.report, 'report');
    } else {
      delete ret.report;
    }

    if (isModelElement(elem.task)) {
      ret.task = new Model(elem.task, 'task');
    } else {
      delete ret.task;
    }

    if (isModelElement(elem.fix_verified_report)) {
      ret.fixVerifiedReport = new Model(elem.fix_verified_report, 'report');
    }
    delete ret.fix_verified_report;

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

    if (!isEmpty(elem.fix_verified_time)) {
      ret.fixVerifiedTime = parseDate(elem.fix_verified_time);
    }
    delete ret.fix_verified_time;

    if (!isEmpty(elem.fixed_time)) {
      ret.fixedTime = parseDate(elem.fixed_time);
    }
    delete ret.fixed_time;

    if (!isEmpty(elem.closed_time)) {
      ret.closedTime = parseDate(elem.closed_time);
    }
    delete ret.closed_time;

    ret.solutionType = elem.solution_type;
    delete ret.solution_type;

    const openNote = parseText(elem.open_note);
    if (!isEmpty(openNote)) {
      ret.openNote = openNote;
    }
    delete ret.open_note;

    const closedNote = parseText(elem.closed_note);
    if (!isEmpty(closedNote)) {
      ret.closedNote = closedNote;
    }
    delete ret.closed_note;

    const fixedNote = parseText(ret.fixed_note);
    if (!isEmpty(fixedNote)) {
      ret.fixedNote = fixedNote;
    }
    delete ret.fixed_note;

    return ret;
  }
}

export default Ticket;

// vim: set ts=2 sw=2 tw=80:
