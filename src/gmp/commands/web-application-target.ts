/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand, {type EntityActionResponse} from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import type {Element} from 'gmp/models/model';
import WebApplicationTarget from 'gmp/models/web-application-target';
import {parseYesNo} from 'gmp/parser';

export interface WebApplicationTargetCreateParams {
  name: string;
  comment?: string;
  copy?: string;
  urls: string;
  excludeUrls?: string;
  credentialId?: string;
  reverseLookupOnly?: boolean;
  reverseLookupUnify?: boolean;
  targetSource?: string;
  targetExcludeSource?: string;
}

export interface WebApplicationTargetSaveParams {
  id: string;
  name?: string;
  comment?: string;
  urls?: string;
  excludeUrls?: string;
  credentialId?: string;
  reverseLookupOnly?: boolean;
  reverseLookupUnify?: boolean;
  inUse?: boolean;
  targetSource?: string;
  targetExcludeSource?: string;
}

const log = logger.getLogger('gmp.commands.webApplicationTarget');

class WebApplicationTargetCommand extends EntityCommand<WebApplicationTarget> {
  constructor(http: Http) {
    super(http, 'web_application_target', WebApplicationTarget);
  }

  async create({
    name,
    comment,
    copy,
    urls,
    excludeUrls,
    credentialId,
    reverseLookupOnly,
    reverseLookupUnify,
    targetSource,
    targetExcludeSource,
  }: WebApplicationTargetCreateParams): Promise<EntityActionResponse> {
    log.debug('Creating new web application target', {
      name,
      comment,
      urls,
      credentialId,
    });
    return this.entityAction({
      cmd: 'create_web_application_target',
      name,
      comment,
      copy,
      target_url: urls,
      exclude_url: excludeUrls || undefined,
      credential_id: credentialId,
      reverse_lookup_only: parseYesNo(reverseLookupOnly),
      reverse_lookup_unify: parseYesNo(reverseLookupUnify),
      target_source: targetSource,
      target_exclude_source: targetExcludeSource,
    });
  }

  async save({
    id,
    name,
    comment,
    urls,
    excludeUrls,
    credentialId,
    reverseLookupOnly,
    reverseLookupUnify,
    inUse,
    targetSource,
    targetExcludeSource,
  }: WebApplicationTargetSaveParams): Promise<EntityActionResponse> {
    log.debug('Modifying web application target', {
      id,
      name,
      comment,
      urls,
      credentialId,
    });
    return this.entityAction({
      cmd: 'save_web_application_target',
      web_application_target_id: id,
      name,
      comment,
      target_url: urls,
      exclude_url: excludeUrls || undefined,
      credential_id: credentialId,
      reverse_lookup_only: parseYesNo(reverseLookupOnly),
      reverse_lookup_unify: parseYesNo(reverseLookupUnify),
      in_use: parseYesNo(inUse),
      target_source: targetSource,
      target_exclude_source: targetExcludeSource,
    });
  }

  getElementFromRoot(root: Element): Element {
    // @ts-expect-error
    return root.get_web_application_target.get_web_application_target_response
      .web_application_target;
  }
}

export default WebApplicationTargetCommand;
