/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseCsv, parseBoolean, type YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface OciImageTargetElement extends ModelElement {
  image_references?: string;
  exclude_images?: string;
  credential?: ModelElement;
  reverse_lookup_only?: YesNo;
  reverse_lookup_unify?: YesNo;
}

interface OciImageTargetProperties extends ModelProperties {
  imageReferences?: string[];
  excludeImages?: string[];
  credential?: Model;
  reverseLookupOnly?: boolean;
  reverseLookupUnify?: boolean;
}

class OciImageTarget extends Model {
  static readonly entityType = 'ociimagetarget';

  readonly imageReferences: string[];
  readonly excludeImages: string[];
  readonly credential?: Model;
  readonly reverseLookupOnly: boolean;
  readonly reverseLookupUnify: boolean;

  constructor({
    imageReferences = [],
    excludeImages = [],
    credential,
    reverseLookupOnly = false,
    reverseLookupUnify = false,
    ...properties
  }: OciImageTargetProperties = {}) {
    super(properties);

    this.imageReferences = imageReferences;
    this.excludeImages = excludeImages;
    this.credential = credential;
    this.reverseLookupOnly = reverseLookupOnly;
    this.reverseLookupUnify = reverseLookupUnify;
  }

  static fromElement(element: OciImageTargetElement = {}): OciImageTarget {
    return new OciImageTarget(this.parseElement(element));
  }

  static parseElement(
    element: OciImageTargetElement,
  ): OciImageTargetProperties {
    const ret = super.parseElement(element) as OciImageTargetProperties;

    if (isDefined(element.credential) && !isEmpty(element.credential._id)) {
      ret.credential = Model.fromElement(element.credential, 'credential');
    } else {
      delete ret.credential;
    }

    ret.imageReferences = parseCsv(element.image_references);
    ret.excludeImages = parseCsv(element.exclude_images);
    ret.reverseLookupOnly = parseBoolean(element.reverse_lookup_only);
    ret.reverseLookupUnify = parseBoolean(element.reverse_lookup_unify);

    return ret;
  }
}

export default OciImageTarget;
