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
import {_l} from 'gmp/locale/lang';

import {parseSeverity, parseDate, parseText} from 'gmp/parser';

import {isDefined, isModelElement} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Model, {parseModelFromElement} from 'gmp/model';

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

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (isDefined(element.assigned_to) && isDefined(element.assigned_to.user)) {
      ret.assignedTo = {
        user: parseModelFromElement(element.assigned_to.user, 'user'),
      };
    }
    delete ret.assigned_to;

    if (isModelElement(element.result)) {
      ret.result = parseModelFromElement(element.result, 'result');
    } else {
      delete ret.result;
    }

    if (isModelElement(element.report)) {
      ret.report = parseModelFromElement(element.report, 'report');
    } else {
      delete ret.report;
    }

    if (isModelElement(element.task)) {
      ret.task = parseModelFromElement(element.task, 'task');
    } else {
      delete ret.task;
    }

    if (isModelElement(element.fix_verified_report)) {
      ret.fixVerifiedReport = parseModelFromElement(
        element.fix_verified_report,
        'report',
      );
    }
    delete ret.fix_verified_report;

    if (isDefined(element.severity)) {
      ret.severity = parseSeverity(element.severity);
    }

    if (isDefined(element.nvt) && !isEmpty(element.nvt._oid)) {
      ret.nvt = {oid: element.nvt._oid};
    }

    if (!isEmpty(element.open_time)) {
      ret.openTime = parseDate(element.open_time);
    }
    delete ret.open_time;

    if (!isEmpty(element.fix_verified_time)) {
      ret.fixVerifiedTime = parseDate(element.fix_verified_time);
    }
    delete ret.fix_verified_time;

    if (!isEmpty(element.fixed_time)) {
      ret.fixedTime = parseDate(element.fixed_time);
    }
    delete ret.fixed_time;

    if (!isEmpty(element.closed_time)) {
      ret.closedTime = parseDate(element.closed_time);
    }
    delete ret.closed_time;

    ret.solutionType = element.solution_type;
    delete ret.solution_type;

    const openNote = parseText(element.open_note);
    if (!isEmpty(openNote)) {
      ret.openNote = openNote;
    }
    delete ret.open_note;

    const closedNote = parseText(element.closed_note);
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
