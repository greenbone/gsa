/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import GMPCommand from 'gmp/commands/gmp';
import License from 'gmp/models/license';

export class LicenseCommand extends GMPCommand {
  constructor(http) {
    super(http, {cmd: 'get_license'});
  }

  getLicenseInformation() {
    return this.httpGet().then(response => {
      const {data: envelope} = response;
      const {get_license_response: licenseResponse} = envelope.get_license;
      const license = License.fromElement(licenseResponse.license);

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
