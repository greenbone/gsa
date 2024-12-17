/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/proptypes';

import withClickHandler from '../form/withClickHandler';
import Layout from '../layout/layout';
import Link from '../link/link';

const StyledLink = styled(Link)`
  height: 100%;
`;

const MenuEntry = ({children, title = children, to, ...props}) => (
  <Layout {...props} align={['start', 'center']} grow="1">
    {isDefined(to) ? <StyledLink to={to}>{title}</StyledLink> : title}
  </Layout>
);

MenuEntry.propTypes = {
  title: PropTypes.string,
  to: PropTypes.string,
};

export default withClickHandler()(MenuEntry);
