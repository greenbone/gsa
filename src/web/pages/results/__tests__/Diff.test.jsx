/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Diff from 'web/pages/results/Diff';
import {render} from 'web/testing';

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
    const {element} = render(<Diff>{diff}</Diff>);

    expect(element).toBeInTheDocument();
  });
});
