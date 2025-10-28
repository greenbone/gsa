/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseProgressElement, type TextElement} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

/*
 * Use own task model for reports to avoid cyclic dependencies
 */

interface ReportTaskElement extends ModelElement {
  progress?: string | number | undefined | TextElement;
  target?: ModelElement;
  agent_group?: ModelElement;
}

interface ReportTaskProperties extends ModelProperties {
  progress?: number;
  target?: Model;
  agentGroup?: Model;
}

class ReportTask extends Model {
  static readonly entityType = 'task';

  readonly progress?: number;
  readonly target?: Model;
  readonly agentGroup?: Model;

  constructor({
    progress,
    target,
    agentGroup,
    ...properties
  }: ReportTaskProperties = {}) {
    super(properties);

    this.progress = progress;
    this.target = target;
    this.agentGroup = agentGroup;
  }

  static fromElement(element: ReportTaskElement = {}): ReportTask {
    return new ReportTask(this.parseElement(element));
  }

  static parseElement(element: ReportTaskElement = {}): ReportTaskProperties {
    const copy = super.parseElement(element) as ReportTaskProperties;

    copy.target = isEmpty(element.target?._id)
      ? undefined
      : Model.fromElement(element.target, 'target');
    copy.agentGroup = isEmpty(element.agent_group?._id)
      ? undefined
      : Model.fromElement(element.agent_group, 'agentgroup');
    copy.progress = isDefined(element.progress)
      ? parseProgressElement(element.progress)
      : undefined;

    return copy;
  }

  isContainer() {
    return !isDefined(this.target) && !isDefined(this.agentGroup);
  }
}

export default ReportTask;
