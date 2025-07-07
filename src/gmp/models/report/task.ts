/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseProgressElement, TextElement} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

/*
 * Use own task model for reports to avoid cyclic dependencies
 */

interface ReportTaskElement extends ModelElement {
  progress?: string | number | undefined | TextElement;
  target?: ModelElement;
}

interface ReportTaskProperties extends ModelProperties {
  progress?: number;
  target?: Model;
}

class ReportTask extends Model {
  static readonly entityType = 'task';

  readonly progress?: number;
  readonly target?: Model;

  constructor({progress, target, ...properties}: ReportTaskProperties = {}) {
    super(properties);

    this.progress = progress;
    this.target = target;
  }

  static fromElement(element: ReportTaskElement = {}): ReportTask {
    return new ReportTask(this.parseElement(element));
  }

  static parseElement(element: ReportTaskElement = {}): ReportTaskProperties {
    const copy = super.parseElement(element) as ReportTaskProperties;

    copy.target = isEmpty(element.target?._id)
      ? undefined
      : Model.fromElement(element.target, 'target');
    copy.progress = isDefined(element.progress)
      ? parseProgressElement(element.progress)
      : undefined;

    return copy;
  }

  isContainer() {
    return !isDefined(this.target);
  }
}

export default ReportTask;
