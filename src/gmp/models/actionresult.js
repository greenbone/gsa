/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {setProperties} from 'gmp/parser';

class ActionResult {
  constructor(elem) {
    const {action_result: result} = elem;

    setProperties(result, this);
  }
}

export default ActionResult;
