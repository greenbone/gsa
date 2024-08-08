/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';

import {parseSeverity} from 'gmp/parser';

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
