/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withLayout, {WithLayoutProps} from 'web/components/layout/withLayout';

export type LayoutProps = WithLayoutProps &
  Omit<React.JSX.IntrinsicElements['div'], 'ref'>;

const Layout = withLayout()('div') as React.FC<LayoutProps>;

Layout.displayName = 'Layout';

export default Layout;
