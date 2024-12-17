/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/layout';
import PropTypes from 'web/utils/proptypes';

const TabTitleCounts = styled.span`
  font-size: 0.7em;
`;

const TabTitle = ({title, counts = {filtered: 0, all: 0}, count}) => (
  <Layout align={['center', 'center']} flex="column">
    <span>{title}</span>
    <TabTitleCounts>
      (<i>{isDefined(count) ? count : _('{{filtered}} of {{all}}', counts)}</i>)
    </TabTitleCounts>
  </Layout>
);

TabTitle.propTypes = {
  count: PropTypes.number,
  counts: PropTypes.shape({
    filtered: PropTypes.numberOrNumberString.isRequired,
    all: PropTypes.numberOrNumberString.isRequired,
  }),
  title: PropTypes.string.isRequired,
};

export default TabTitle;
