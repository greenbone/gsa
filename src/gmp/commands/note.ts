/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import Note, {type NoteElement} from 'gmp/models/note';
import {
  type Active,
  ACTIVE_YES_UNTIL_VALUE,
  ANY,
  type AnyOrManual,
  DEFAULT_DAYS,
  MANUAL,
} from 'gmp/models/override';

interface NoteCommandCreateParams {
  active?: Active;
  days?: number;
  hosts_manual?: string;
  hosts?: AnyOrManual;
  oid: string;
  port_manual?: string;
  port?: AnyOrManual;
  result_id?: AnyOrManual;
  result_uuid?: string;
  severity?: string;
  task_id?: AnyOrManual;
  task_uuid?: string;
  text: string;
}

interface NoteCommandSaveParams extends NoteCommandCreateParams {
  id: string;
}

class NoteCommand extends EntityCommand<Note, NoteElement> {
  constructor(http: Http) {
    super(http, 'note', Note);
  }

  getElementFromRoot(root: XmlResponseData): NoteElement {
    // @ts-expect-error
    return root.get_note.get_notes_response.note;
  }

  create(args: NoteCommandCreateParams) {
    return this._save({cmd: 'create_note', ...args});
  }

  save(args: NoteCommandSaveParams) {
    return this._save({cmd: 'save_note', ...args});
  }

  _save({
    cmd,
    oid,
    id,
    active,
    days = DEFAULT_DAYS,
    hosts = ANY,
    hosts_manual,
    result_id = ANY,
    result_uuid,
    port = ANY,
    port_manual,
    severity,
    task_id = ANY,
    task_uuid,
    text,
  }: NoteCommandCreateParams & {
    id?: string;
    cmd: 'save_note' | 'create_note';
  }) {
    return this.action({
      cmd,
      oid,
      id,
      active: active === ACTIVE_YES_UNTIL_VALUE ? days : active,
      hosts: hosts === MANUAL ? hosts_manual : undefined,
      result_id: result_id === MANUAL ? result_uuid : undefined,
      task_id: task_id === MANUAL ? task_uuid : undefined,
      port: port === MANUAL ? port_manual : undefined,
      severity,
      text,
    });
  }
}

export default NoteCommand;
