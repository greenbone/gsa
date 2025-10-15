/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import Nvt, {type NvtNvtElement} from 'gmp/models/nvt';
import {
  parseCsv,
  parseSeverity,
  parseTextElement,
  parseToString,
  parseYesNo,
  type TextElement,
  YES_VALUE,
  type YesNo,
} from 'gmp/parser';
import {isDefined, isModelElement} from 'gmp/utils/identity';

export interface OverrideElement extends ModelElement {
  hosts?: string;
  new_severity?: number;
  new_thread?: string;
  nvt?: NvtNvtElement;
  port?: string;
  result?: ModelElement;
  severity?: number;
  task?: ModelElement;
  text?: string | TextElement;
  thread?: string;
  text_excerpt?: YesNo;
}

interface OverrideProperties extends ModelProperties {
  hosts?: string[];
  newSeverity?: number;
  nvt?: Nvt;
  port?: string;
  result?: Model;
  severity?: number;
  task?: Model;
  text?: string;
  textExcerpt?: YesNo;
}

export const MANUAL = '1';
export const ANY = '0';

export const ACTIVE_NO_VALUE = '0';
export const ACTIVE_YES_FOR_NEXT_VALUE = '1';
export const ACTIVE_YES_ALWAYS_VALUE = '-1';
export const ACTIVE_YES_UNTIL_VALUE = '-2';

export const DEFAULT_DAYS = 30;
export const DEFAULT_OID_VALUE = '1.3.6.1.4.1.25623.1.';

export const TASK_ANY = '';
export const TASK_SELECTED = '0';

export const RESULT_ANY = '';
export const RESULT_UUID = '0';

export const SEVERITY_FALSE_POSITIVE = -1;

class Override extends Model {
  static readonly entityType = 'override';

  readonly hosts?: string[];
  readonly newSeverity?: number;
  readonly nvt?: Nvt;
  readonly port?: string;
  readonly result?: Model;
  readonly severity?: number;
  readonly task?: Model;
  readonly text?: string;
  readonly textExcerpt?: YesNo;

  constructor({
    hosts = [],
    newSeverity,
    nvt,
    port,
    result,
    severity,
    task,
    text,
    textExcerpt,
    ...properties
  }: OverrideProperties = {}) {
    super(properties);

    this.hosts = hosts;
    this.newSeverity = newSeverity;
    this.nvt = nvt;
    this.port = port;
    this.result = result;
    this.severity = severity;
    this.task = task;
    this.text = text;
    this.textExcerpt = textExcerpt;
  }

  static fromElement(element: OverrideElement = {}): Override {
    return new Override(this.parseElement(element));
  }

  static parseElement(element: OverrideElement = {}): OverrideProperties {
    const ret = super.parseElement(element) as OverrideProperties;

    if (element.nvt) {
      ret.nvt = Nvt.fromElement({nvt: element.nvt});
      ret.name = ret.nvt.name;
    }

    ret.severity = parseSeverity(element.severity);
    ret.newSeverity = parseSeverity(element.new_severity);

    const {text, textExcerpt} = parseTextElement(element.text);
    ret.text = text;
    ret.textExcerpt = textExcerpt;

    if (isDefined(element.text_excerpt)) {
      ret.textExcerpt = parseYesNo(element.text_excerpt);
    }

    ret.task = isModelElement(element.task)
      ? Model.fromElement(element.task, 'task')
      : undefined;
    ret.result = isModelElement(element.result)
      ? Model.fromElement(element.result, 'result')
      : undefined;

    ret.hosts = parseCsv(element.hosts);
    ret.port = parseToString(element.port);

    return ret;
  }

  isExcerpt() {
    return this.textExcerpt === YES_VALUE;
  }
}

export default Override;
