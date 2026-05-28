/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import styled from 'styled-components';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const TabTitleCounts = styled.span`
  font-size: 0.7em;
`;

const TabTitle = ({
  title,
  counts = {filtered: 0, all: 0},
  count,
  isLoading = false,
}) => {
  const [_] = useTranslation();

  let countLabel;
  if (isLoading) {
    countLabel = '...';
  } else if (isDefined(count)) {
    countLabel = count;
  } else {
    countLabel = _('{{filtered}} of {{all}}', counts);
  }

  return (
    <Layout align={['center', 'center']} flex="column">
      <span>{title}</span>
      <TabTitleCounts>
        (<i>{countLabel}</i>)
      </TabTitleCounts>
    </Layout>
  );
};

TabTitle.propTypes = {
  count: PropTypes.number,
  counts: PropTypes.shape({
    filtered: PropTypes.numberOrNumberString.isRequired,
    all: PropTypes.numberOrNumberString.isRequired,
  }),
  isLoading: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

export default TabTitle;
