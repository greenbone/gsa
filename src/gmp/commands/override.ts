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
  custom_severity?: boolean;
  days?: number;
  hosts_manual?: string;
  hosts?: AnyOrManual;
  oid: string;
  newSeverity?: number;
  new_severity_from_list?: number;
  port_manual?: string;
  port?: AnyOrManual;
  result_id?: AnyOrManual;
  result_uuid?: string;
  severity?: string;
  task_id?: AnyOrManual;
  task_uuid?: string;
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
      hosts_manual,
      result_id,
      result_uuid,
      port = ANY,
      port_manual,
      severity,
      task_id,
      task_uuid,
      text,
      custom_severity = false,
      newSeverity,
      new_severity_from_list = SEVERITY_FALSE_POSITIVE,
    } = args;
    return this.action({
      cmd,
      oid,
      id,
      active: active === ACTIVE_YES_UNTIL_VALUE ? days : active,
      new_severity: custom_severity ? newSeverity : new_severity_from_list,
      hosts: hosts === MANUAL ? hosts_manual : undefined,
      result_id: result_id === MANUAL ? result_uuid : undefined,
      task_id: task_id === MANUAL ? task_uuid : undefined,
      port: port === MANUAL ? port_manual : undefined,
      severity,
      text,
    });
  }
}

export default OverrideCommand;
