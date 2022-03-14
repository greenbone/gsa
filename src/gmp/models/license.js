/* Copyright (C) 2022 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {parseDate} from 'gmp/parser';

export class License {
  constructor({
    id,
    status,
    customerName,
    created,
    version,
    begins,
    expires,
    comment,
    type,
    applianceModel,
    applianceModelType,
  }) {
    this.status = status;
    this.id = id;
    this.customerName = customerName;
    this.version = version;
    this.created = created;
    this.begins = begins;
    this.expires = expires;
    this.comment = comment;
    this.type = type;

    this.applianceModel = applianceModel;
    this.applianceModelType = applianceModelType;
  }

  static fromElement(element) {
    const {content, status} = element;
    return new License({
      status: status,
      id: content?.meta?.id,
      customerName: content?.meta?.customer_name,
      created: parseDate(content?.meta?.created),
      version: content?.meta?.version,
      begins: parseDate(content?.meta?.begins),
      expires: parseDate(content?.meta?.expires),
      comment: content?.meta?.comment,
      type: content?.meta?.type,
      applianceModel: content?.appliance?.model,
      applianceModelType: content?.appliance?.model_type,
    });
  }
}

export default License;
