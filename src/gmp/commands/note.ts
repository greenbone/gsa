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
  hostsManual?: string;
  hosts?: AnyOrManual;
  oid: string;
  portManual?: string;
  port?: AnyOrManual;
  resultId?: AnyOrManual;
  resultUuid?: string;
  severity?: string;
  taskId?: AnyOrManual;
  taskUuid?: string;
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
    hostsManual,
    resultId = ANY,
    resultUuid,
    port = ANY,
    portManual,
    severity,
    taskId = ANY,
    taskUuid,
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
      hosts: hosts === MANUAL ? hostsManual : undefined,
      result_id: resultId === MANUAL ? resultUuid : undefined,
      task_id: taskId === MANUAL ? taskUuid : undefined,
      port: port === MANUAL ? portManual : undefined,
      severity,
      text,
    });
  }
}

export default NoteCommand;
