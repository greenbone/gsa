/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import withClickHandler from '../form/withClickHandler';

import Layout from '../layout/layout';

import Link from '../link/link';

const StyledLink = styled(Link)`
  height: 100%;
`;

const MenuEntry = ({children, title = children, to, ...props}) => (
  <Layout {...props} grow="1" align={['start', 'center']}>
    {isDefined(to) ? <StyledLink to={to}>{title}</StyledLink> : title}
  </Layout>
);

MenuEntry.propTypes = {
  title: PropTypes.string,
  to: PropTypes.string,
};

export default withClickHandler()(MenuEntry);

// vim: set ts=2 sw=2 tw=80:
