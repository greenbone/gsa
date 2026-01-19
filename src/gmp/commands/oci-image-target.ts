/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand, {type EntityActionResponse} from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import type {Element} from 'gmp/models/model';
import OciImageTarget from 'gmp/models/oci-image-target';
import {parseYesNo} from 'gmp/parser';

export interface OciImageTargetCreateParams {
  name: string;
  comment?: string;
  copy?: string;
  imageReferences: string;
  credentialId?: string;
  excludeImages?: string;
  hosts?: string;
  reverseLookupOnly?: boolean;
  reverseLookupUnify?: boolean;
  targetSource?: string;
  targetExcludeSource?: string;
  file?: File;
  excludeFile?: File;
  hostsFilter?: string;
}

export interface OciImageTargetSaveParams {
  id: string;
  name?: string;
  comment?: string;
  imageReferences?: string;
  credentialId?: string;
  excludeImages?: string;
  excludeFile?: File;
  file?: File;
  reverseLookupOnly?: boolean;
  reverseLookupUnify?: boolean;
  inUse?: boolean;
  targetSource?: string;
  targetExcludeSource?: string;
}

const log = logger.getLogger('gmp.commands.ociImageTarget');

class OciImageTargetCommand extends EntityCommand<OciImageTarget> {
  constructor(http: Http) {
    super(http, 'oci_image_target', OciImageTarget);
  }

  async create({
    name,
    comment,
    copy,
    imageReferences,
    credentialId,
    targetSource,
    targetExcludeSource,
    hosts,
    excludeImages,
    reverseLookupOnly,
    reverseLookupUnify,
    file,
    excludeFile,
    hostsFilter,
  }: OciImageTargetCreateParams): Promise<EntityActionResponse> {
    log.debug('Creating new OCI image target', {
      name,
      comment,
      copy,
      imageReferences,
      credentialId,
      excludeImages,
      hosts,
      reverseLookupOnly,
      reverseLookupUnify,
      targetSource,
      targetExcludeSource,
    });

    return this.entityAction({
      cmd: 'create_oci_image_target',
      name,
      comment,
      target_source: targetSource,
      target_exclude_source: targetExcludeSource,
      hosts,
      image_references: imageReferences,
      reverse_lookup_only: parseYesNo(reverseLookupOnly),
      reverse_lookup_unify: parseYesNo(reverseLookupUnify),
      credential_id: credentialId,
      file,
      exclude_file: excludeFile,
      hosts_filter: hostsFilter,
      exclude_images: excludeImages || undefined,
    });
  }

  async save({
    id,
    name,
    comment,
    imageReferences,
    credentialId,
    excludeImages,
    excludeFile,
    file,
    reverseLookupOnly,
    reverseLookupUnify,
    inUse,
    targetSource,
    targetExcludeSource,
  }: OciImageTargetSaveParams): Promise<EntityActionResponse> {
    log.debug('Modifying OCI image target', {
      id,
      name,
      comment,
      imageReferences,
      credentialId,
      excludeImages,
      excludeFile,
      file,
      reverseLookupOnly,
      reverseLookupUnify,
      inUse,
      targetSource,
      targetExcludeSource,
    });

    return this.entityAction({
      cmd: 'save_oci_image_target',
      oci_image_target_id: id,
      name,
      comment,
      image_references: imageReferences,
      credential_id: credentialId,
      exclude_file: excludeFile,
      file,
      reverse_lookup_only: parseYesNo(reverseLookupOnly),
      reverse_lookup_unify: parseYesNo(reverseLookupUnify),
      in_use: parseYesNo(inUse),
      target_source: targetSource,
      target_exclude_source: targetExcludeSource,
      exclude_images: excludeImages || undefined,
    });
  }

  getElementFromRoot(root: Element): Element {
    // @ts-expect-error
    return root.get_oci_image_target.get_oci_image_target_response
      .oci_image_target;
  }
}

export default OciImageTargetCommand;
