/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {
  ModelElement,
  ModelProperties,
  parseModelFromElement,
} from 'gmp/models/model';
import Nvt from 'gmp/models/nvt';
import {
  parseCsv,
  parseSeverity,
  parseTextElement,
  parseToString,
  parseYesNo,
  YES_VALUE,
  YesNo,
} from 'gmp/parser';
import {isDefined, isModelElement} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export const NOTE_ACTIVE_UNLIMITED_VALUE = -2;
export const NOTE_INACTIVE_VALUE = -1;

interface NoteElement extends ModelElement {
  hosts?: string;
  nvt?: ModelElement;
  port?: string;
  result?: ModelElement;
  severity?: number;
  task?: ModelElement;
  text?: string | object;
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

class Note extends Model {
  static entityType = 'note';

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

    if (isDefined(element.text)) {
      const textElement = parseTextElement(element.text);
      ret.text = parseToString(textElement.text);
    }
    ret.textExcerpt = isDefined(element.text_excerpt)
      ? parseYesNo(element.text_excerpt)
      : undefined;
    ret.severity = parseSeverity(ret.severity);

    if (isModelElement(element.task)) {
      ret.task = Model.fromElement(element.task, 'task');
    } else {
      delete ret.task;
    }

    if (isModelElement(element.result)) {
      ret.result = parseModelFromElement(element.result, 'result');
    } else {
      delete ret.result;
    }

    ret.hosts = parseCsv(element.hosts);

    if (isEmpty(element.port)) {
      delete ret.port;
    }

    return ret;
  }

  isExcerpt() {
    return this.textExcerpt === YES_VALUE;
  }
}

export default Note;
