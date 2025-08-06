/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import ResultDiff, {
  DIFF_COLOR_ADDED,
  DIFF_COLOR_INFO,
  DIFF_COLOR_REMOVED,
} from 'web/pages/results/ResultDiff';

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

describe('ResultDiff tests', () => {
  test('should render', () => {
    render(<ResultDiff>{diff}</ResultDiff>);
    const items = screen.getAllByTestId('result-diff-item');
    expect(items).toHaveLength(19);
    expect(items[0]).toHaveTextContent('@@ -1,9 +1,14 @@');
    expect(items[0]).toHaveStyle(`color: ${DIFF_COLOR_INFO}`);
    expect(items[1]).toHaveTextContent(
      '-Remote SSH server version: SSH-2.0-OpenSSH_7.6p1 Ubuntu-4',
    );
    expect(items[1]).toHaveStyle(`background-color: ${DIFF_COLOR_REMOVED}`);
    expect(items[2]).toHaveTextContent(
      '+Remote SSH server banner: SSH-2.0-OpenSSH_7.6p1 Ubuntu-4ubuntu0.3',
    );
    expect(items[2]).toHaveStyle(`background-color: ${DIFF_COLOR_ADDED}`);
  });
});
