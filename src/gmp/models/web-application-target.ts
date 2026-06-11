/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseCsv, parseBoolean, type YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface WebApplicationTargetElement extends ModelElement {
  urls?: string;
  exclude_urls?: string;
  credential?: ModelElement;
  reverse_lookup_only?: YesNo;
  reverse_lookup_unify?: YesNo;
}

interface WebApplicationTargetProperties extends ModelProperties {
  urls?: string[];
  excludeUrls?: string[];
  credential?: Model;
  reverseLookupOnly?: boolean;
  reverseLookupUnify?: boolean;
}

class WebApplicationTarget extends Model {
  static readonly entityType = 'webapplicationtarget';

  readonly urls: string[];
  readonly excludeUrls: string[];
  readonly credential?: Model;
  readonly reverseLookupOnly: boolean;
  readonly reverseLookupUnify: boolean;

  constructor({
    urls = [],
    excludeUrls = [],
    credential,
    reverseLookupOnly = false,
    reverseLookupUnify = false,
    ...properties
  }: WebApplicationTargetProperties = {}) {
    super(properties);
    this.urls = urls;
    this.excludeUrls = excludeUrls;
    this.credential = credential;
    this.reverseLookupOnly = reverseLookupOnly;
    this.reverseLookupUnify = reverseLookupUnify;
  }

  /** Backward-compatible accessor for the primary URL */
  get url(): string {
    return this.urls[0] ?? '';
  }

  static fromElement(
    element: WebApplicationTargetElement = {},
  ): WebApplicationTarget {
    return new WebApplicationTarget(this.parseElement(element));
  }

  static parseElement(
    element: WebApplicationTargetElement,
  ): WebApplicationTargetProperties {
    const ret = super.parseElement(element) as WebApplicationTargetProperties;
    ret.urls = parseCsv(element.urls);
    ret.excludeUrls = parseCsv(element.exclude_urls);
    if (isDefined(element.credential) && !isEmpty(element.credential._id)) {
      ret.credential = Model.fromElement(element.credential, 'credential');
    } else {
      delete ret.credential;
    }
    ret.reverseLookupOnly = parseBoolean(element.reverse_lookup_only);
    ret.reverseLookupUnify = parseBoolean(element.reverse_lookup_unify);
    return ret;
  }
}

export default WebApplicationTarget;
