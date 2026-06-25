/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import logger from 'gmp/log';
import Group, {type GroupElement} from 'gmp/models/group';
import {parseYesNo} from 'gmp/parser';
import {isArray, isDefined} from 'gmp/utils/identity';

interface GroupCommandCreateParams {
  name: string;
  comment?: string;
  grant_full?: boolean;
  users?: string[];
}

interface GroupCommandSaveParams extends GroupCommandCreateParams {
  id: string;
}

const log = logger.getLogger('gmp.commands.groups');

class GroupCommand extends EntityCommand<Group, GroupElement> {
  constructor(http: Http) {
    super(http, 'group', Group);
  }

  create({
    name,
    comment = '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    grant_full,
    users = [],
  }: GroupCommandCreateParams) {
    const data = {
      cmd: 'create_group',
      name,
      comment,
      grant_full: isDefined(grant_full) ? parseYesNo(grant_full) : undefined,
      users: isArray(users) ? users.join(',') : '',
    };
    log.debug('Creating new group', data);
    return this.action(data);
  }

  save({
    id,
    name,
    comment = '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    grant_full,
    users = [],
  }: GroupCommandSaveParams) {
    const data = {
      cmd: 'save_group',
      id,
      name,
      comment,
      grant_full: isDefined(grant_full) ? parseYesNo(grant_full) : undefined,
      users: isArray(users) ? users.join(',') : '',
    };
    log.debug('Saving group', data);
    return this.action(data);
  }

  getElementFromRoot(root: XmlResponseData): GroupElement {
    // @ts-expect-error
    return root.get_group.get_groups_response.group;
  }
}

export default GroupCommand;
