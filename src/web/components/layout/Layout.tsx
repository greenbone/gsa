/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// @ts-expect-error not typed
import withLayout from 'web/components/layout/withLayout';

interface LayoutProps {
  align?: string[];
  shrink?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

const Layout: React.FC<LayoutProps> = withLayout()('div');

Layout.displayName = 'Layout';

export default Layout;
