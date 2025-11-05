/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import OciImageTarget from 'gmp/models/oci-image-target';

class OciImageTargetsCommand extends EntitiesCommand<OciImageTarget> {
  constructor(http: Http) {
    super(http, 'oci_image_target', OciImageTarget);
  }

  getEntitiesResponse(root: XmlResponseData): XmlResponseData {
    // @ts-expect-error
    return root.get_oci_image_targets.get_oci_image_targets_response;
  }
}

export default OciImageTargetsCommand;
