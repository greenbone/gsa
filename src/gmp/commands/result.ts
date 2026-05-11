/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import Result from 'gmp/models/result';

export class ResultCommand extends EntityCommand<Result> {
  constructor(http: Http) {
    super(http, 'result', Result);
  }

  getElementFromRoot(root: Element): Element {
    // @ts-expect-error
    return root.get_result.get_results_response.result;
  }
}
