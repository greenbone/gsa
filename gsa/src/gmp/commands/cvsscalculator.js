/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import registerCommand from '../command';

import {parseSeverity} from '../parser';

import HttpCommand from './http';

class CvssCalculator extends HttpCommand {
  constructor(http) {
    super(http, {cmd: 'cvss_calculator'});
  }

  calculateScoreFromVector(cvss_vector) {
    return this.httpGet({
      cvss_vector,
    }).then(response => {
      const {data: envelope} = response;
      const score = parseSeverity(envelope.cvss_calculator.cvss_score);
      return response.setData(score);
    });
  }
}

registerCommand('cvsscalculator', CvssCalculator);

// vim: set ts=2 sw=2 tw=80:
