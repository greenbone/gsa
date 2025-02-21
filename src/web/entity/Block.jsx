/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';

const DetailsBlock = ({id, children, className, title}) => (
  <Layout className={className} flex="column" id={id}>
    <h2>{title}</h2>
    <div>{children}</div>
  </Layout>
);

DetailsBlock.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default DetailsBlock;
