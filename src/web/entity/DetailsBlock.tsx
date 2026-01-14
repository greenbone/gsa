/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Layout from 'web/components/layout/Layout';

interface DetailsBlockProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  title: string;
  'data-testid'?: string;
}

const DetailsBlock = ({
  id,
  children,
  className,
  title,
  'data-testid': dataTestId,
}: DetailsBlockProps) => (
  <Layout className={className} data-testid={dataTestId} flex="column" id={id}>
    <h2>{title}</h2>
    <div>{children}</div>
  </Layout>
);

export default DetailsBlock;
