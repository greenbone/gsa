/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Element} from 'gmp/model';

interface ActionResultElement extends Element {
  action_result: {
    id: string;
    action: string;
    message: string;
  };
}

class ActionResult {
  readonly action: string;
  readonly id: string;
  readonly message: string;

  constructor(elem: Element) {
    const {action_result: result} = elem as ActionResultElement;

    this.id = result.id;
    this.action = result.action;
    this.message = result.message;
  }
}

export default ActionResult;
