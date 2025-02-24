/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Layout from 'web/components/layout/Layout';
import IconSizeProvider from 'web/components/provider/IconSizeProvider';

const Toolbar = props => {
  return (
    <IconSizeProvider size="small">
      <Layout
        flex
        align={['space-between', 'start']}
        {...props}
        className="toolbar"
      />
    </IconSizeProvider>
  );
};

export default Toolbar;
