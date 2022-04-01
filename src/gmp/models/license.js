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

import _ from 'gmp/locale';

import {parseDate} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

const LICENSE_MODEL = {
  trial: 'Greenbone Enterprise TRIAL',
  '25v': 'Greenbone Enterprise 25V',
  25: 'Greenbone Enterprise 25',
  35: 'Greenbone Enterprise 35',
  maven: 'Greenbone Enterprise MAVEN',
  one: 'Greenbone Enterprise ONE',
  100: 'Greenbone Enterprise 100',
  150: 'Greenbone Enterprise 150',
  ceno: 'Greenbone Enterprise CENO',
  deca: 'Greenbone Enterprise DECA',
  400: 'Greenbone Enterprise 400',
  '400r2': 'Greenbone Enterprise 400',
  450: 'Greenbone Enterprise 450',
  '450r2': 'Greenbone Enterprise 450',
  tera: 'Greenbone Enterprise TERA',
  500: 'Greenbone Enterprise 500',
  510: 'Greenbone Enterprise 510',
  550: 'Greenbone Enterprise 550',
  600: 'Greenbone Enterprise 600',
  '600r2': 'Greenbone Enterprise 600',
  peta: 'Greenbone Enterprise PETA',
  650: 'Greenbone Enterprise 650',
  '650r2': 'Greenbone Enterprise 650',
  exa: 'Greenbone Enterprise EXA',
  5300: 'Greenbone Enterprise 5300',
  6400: 'Greenbone Enterprise 6400',
  5400: 'Greenbone Enterprise 5400',
  6500: 'Greenbone Enterprise 6500',
  expo: 'Greenbone Enterprise EXPO',
  '150c-siesta': 'Greenbone Enterprise 150C-SiESTA',
};

export const getLicenseApplianceModelName = value => {
  const name = LICENSE_MODEL[value];
  return isDefined(name) ? name : value;
};

export const getLicenseApplianceModelType = value => {
  if (!isDefined(value)) {
    return value;
  }
  if (value === 'virtual') {
    return 'Virtual Appliance';
  }
  if (value === 'hardware') {
    return 'Hardware Appliance';
  }
  return _('Unknown');
};

export const getTranslatableLicenseStatus = value => {
  switch (value) {
    case 'active':
      return _('License is active');
    case 'corrupt':
      return _('License is corrupted');
    case 'expired':
      return _('License has expired');
    case 'no_license':
      return _('No license available');
    default:
      return _('N/A');
  }
};

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
