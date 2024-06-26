/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

const DetailsBlock = ({id, children, className, title}) => (
  <Layout flex="column" id={id} className={className}>
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

// vim: set ts=2 sw=2 tw=80:
