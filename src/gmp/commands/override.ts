/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import Override, {
  ACTIVE_YES_UNTIL_VALUE,
  ANY,
  DEFAULT_DAYS,
  MANUAL,
  SEVERITY_FALSE_POSITIVE,
  type Active,
  type AnyOrManual,
  type OverrideElement,
} from 'gmp/models/override';

interface OverrideCommandCreateParams {
  active?: Active;
  customSeverity?: boolean;
  days?: number;
  hostsManual?: string;
  hosts?: AnyOrManual;
  oid: string;
  newSeverity?: number;
  newSeverityFromList?: number;
  portManual?: string;
  port?: AnyOrManual;
  resultId?: AnyOrManual;
  resultUuid?: string;
  severity?: string;
  taskId?: AnyOrManual;
  taskUuid?: string;
  text: string;
}

interface OverrideCommandSaveParams extends OverrideCommandCreateParams {
  id: string;
}

class OverrideCommand extends EntityCommand<Override, OverrideElement> {
  constructor(http: Http) {
    super(http, 'override', Override);
  }

  getElementFromRoot(root: XmlResponseData): OverrideElement {
    // @ts-expect-error
    return root.get_override.get_overrides_response.override;
  }

  create(args: OverrideCommandCreateParams) {
    return this._save({...args, cmd: 'create_override'});
  }

  save(args: OverrideCommandSaveParams) {
    return this._save({...args, cmd: 'save_override'});
  }

  _save(
    args: OverrideCommandCreateParams & {
      id?: string;
      cmd: 'create_override' | 'save_override';
    },
  ) {
    const {
      cmd,
      oid,
      id,
      active,
      days = DEFAULT_DAYS,
      hosts = ANY,
      hostsManual,
      resultId,
      resultUuid,
      port = ANY,
      portManual,
      severity,
      taskId,
      taskUuid,
      text,
      customSeverity = false,
      newSeverity,
      newSeverityFromList = SEVERITY_FALSE_POSITIVE,
    } = args;
    return this.action({
      cmd,
      oid,
      id,
      active: active === ACTIVE_YES_UNTIL_VALUE ? days : active,
      new_severity: customSeverity ? newSeverity : newSeverityFromList,
      hosts: hosts === MANUAL ? hostsManual : undefined,
      result_id: resultId === MANUAL ? resultUuid : undefined,
      task_id: taskId === MANUAL ? taskUuid : undefined,
      port: port === MANUAL ? portManual : undefined,
      severity,
      text,
    });
  }
}

export default OverrideCommand;
