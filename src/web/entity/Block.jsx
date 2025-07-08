/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';

const DetailsBlock = ({
  id,
  children,
  className,
  title,
  'data-testid': dataTestId,
}) => (
  <Layout className={className} data-testid={dataTestId} flex="column" id={id}>
    <h2>{title}</h2>
    <div>{children}</div>
  </Layout>
);

DetailsBlock.propTypes = {
  className: PropTypes.string,
  'data-testid': PropTypes.string,
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default DetailsBlock;
