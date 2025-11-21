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
  oci_image_target?: ModelElement;
}

interface ReportTaskProperties extends ModelProperties {
  progress?: number;
  target?: Model;
  agentGroup?: Model;
  ociImageTarget?: Model;
}

class ReportTask extends Model {
  static readonly entityType = 'task';

  readonly progress?: number;
  readonly target?: Model;
  readonly agentGroup?: Model;
  readonly ociImageTarget?: Model;

  constructor({
    progress,
    target,
    agentGroup,
    ociImageTarget,
    ...properties
  }: ReportTaskProperties = {}) {
    super(properties);

    this.progress = progress;
    this.target = target;
    this.agentGroup = agentGroup;
    this.ociImageTarget = ociImageTarget;
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
    copy.ociImageTarget = isEmpty(element.oci_image_target?._id)
      ? undefined
      : Model.fromElement(element.oci_image_target, 'ociimagetarget');
    copy.progress = isDefined(element.progress)
      ? parseProgressElement(element.progress)
      : undefined;

    return copy;
  }

  isImport() {
    return (
      !isDefined(this.target) &&
      !isDefined(this.agentGroup) &&
      !isDefined(this.ociImageTarget)
    );
  }
}

export default ReportTask;
