/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import Nvt, {NvtNvtElement} from 'gmp/models/nvt';
import {
  parseCsv,
  parseSeverity,
  parseTextElement,
  parseToString,
  parseYesNo,
  TextElement,
  YES_VALUE,
  YesNo,
} from 'gmp/parser';
import {isDefined, isModelElement} from 'gmp/utils/identity';

export interface NoteElement extends ModelElement {
  hosts?: string;
  nvt?: NvtNvtElement;
  port?: string;
  result?: ModelElement;
  severity?: number;
  task?: ModelElement;
  text?: string | TextElement;
  text_excerpt?: string;
}

interface NoteProperties extends ModelProperties {
  hosts?: string[];
  nvt?: Nvt;
  port?: string;
  result?: Model;
  severity?: number;
  task?: Model;
  text?: string;
  textExcerpt?: YesNo;
}

export const NOTE_ACTIVE_UNLIMITED_VALUE = -2;
export const NOTE_INACTIVE_VALUE = -1;

class Note extends Model {
  static readonly entityType = 'note';

  readonly hosts: string[];
  readonly nvt?: Nvt;
  readonly port?: string;
  readonly result?: Model;
  readonly severity?: number;
  readonly task?: Model;
  readonly text?: string;
  readonly textExcerpt?: YesNo;

  constructor({
    hosts = [],
    nvt,
    port,
    result,
    severity,
    task,
    text,
    textExcerpt,
    ...properties
  }: NoteProperties = {}) {
    super(properties);

    this.hosts = hosts;
    this.nvt = nvt;
    this.port = port;
    this.result = result;
    this.severity = severity;
    this.task = task;
    this.text = text;
    this.textExcerpt = textExcerpt;
  }

  static fromElement(element?: NoteElement): Note {
    return new Note(this.parseElement(element));
  }

  static parseElement(element: NoteElement = {}): NoteProperties {
    let ret = super.parseElement(element) as NoteProperties;

    if (element.nvt) {
      ret.nvt = Nvt.fromElement({nvt: element.nvt});
      ret.name = ret.nvt.name;
    }

    const {text, textExcerpt} = parseTextElement(element.text);
    ret.text = text;
    ret.textExcerpt = textExcerpt;

    if (isDefined(element.text_excerpt)) {
      ret.textExcerpt = parseYesNo(element.text_excerpt);
    }

    ret.severity = parseSeverity(ret.severity);

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

export default Note;
