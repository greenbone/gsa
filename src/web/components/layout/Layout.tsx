/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withLayout, {LayoutProps} from 'web/components/layout/withLayout';

const Layout: React.FC<LayoutProps> = withLayout()('div');

Layout.displayName = 'Layout';

export default Layout;
