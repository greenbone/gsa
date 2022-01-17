/* Copyright (C) 2021 Greenbone Networks GmbH
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

import registerCommand from 'gmp/command';

import {parseDate} from 'gmp/parser';

import GMPCommand from './gmp';

export class License {
  constructor({content}) {
    this.id = content?.meta?.id;
    this.customerName = content?.meta?.customer_name;
    this.creationDate = parseDate(content?.meta?.created);
    this.version = content?.meta?.version;
    this.begins = parseDate(content?.meta?.begins);
    this.expires = parseDate(content?.meta?.expires);
    this.comment = content?.meta?.comment;

    this.model = content?.appliance?.model;
    this.modelType = content?.appliance?.model_type;

    this.key = {};
    this.key.name = content?.keys?.key._name;
    this.key.value = content?.keys?.key.__text;
  }
}

export class LicenseCommand extends GMPCommand {
  constructor(http) {
    super(http, {cmd: 'get_license'});
  }

  getLicenseInformation() {
    return this.httpGet().then(response => {
      const {data: envelope} = response;
      const {get_license_response: licenseResponse} = envelope.get_license;
      const license = new License(licenseResponse.license);

      return response.setData(license);
    });
  }

  modifyLicense(file) {
    return this.action({
      cmd: 'save_license',
      file,
    });
  }
}

registerCommand('license', LicenseCommand);

// vim: set ts=2 sw=2 tw=80:
