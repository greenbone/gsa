/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import React from 'react';

import {render} from 'web/utils/testing';

import Diff from '../diff';

const diff = `
@@ -1,9 +1,14 @@
-Remote SSH server version: SSH-2.0-OpenSSH_7.6p1 Ubuntu-4
+Remote SSH server banner: SSH-2.0-OpenSSH_7.6p1 Ubuntu-4ubuntu0.3
 Remote SSH supported authentication: password,publickey
-Remote SSH banner: (not available)
+Remote SSH text/login banner: (not available)
+
+This is probably:
+
+- OpenSSH

 CPE: cpe:/a:openbsd:openssh:7.6p1

 Concluded from remote connection attempt with credentials:
-  Login: VulnScan
-  Password: VulnScan
+
+Login:    OpenVAS-VT
+Password: OpenVAS-VT
`;

describe('Diff component tests', () => {
  test('should render', () => {
    const {container} = render(<Diff>{diff}</Diff>);

    expect(container).toMatchSnapshot();
  });
});
