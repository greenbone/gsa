/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface WebApplicationTargetElement extends ModelElement {
  target_url?: string;
  credential?: ModelElement;
}

interface WebApplicationTargetProperties extends ModelProperties {
  url?: string;
  credential?: Model;
}

class WebApplicationTarget extends Model {
  static readonly entityType = 'webapplicationtarget';

  readonly url: string;
  readonly credential?: Model;

  constructor({
    url = '',
    credential,
    ...properties
  }: WebApplicationTargetProperties = {}) {
    super(properties);
    this.url = url;
    this.credential = credential;
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
    ret.url = element.target_url ?? '';
    if (isDefined(element.credential) && !isEmpty(element.credential._id)) {
      ret.credential = Model.fromElement(element.credential, 'credential');
    } else {
      delete ret.credential;
    }
    return ret;
  }
}

export default WebApplicationTarget;
