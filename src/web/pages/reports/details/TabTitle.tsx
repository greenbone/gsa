/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';

interface TabTitleProps {
  count?: number | string;
  counts?: {
    filtered: number | string;
    all: number | string;
  };
  isLoading?: boolean;
  title: string;
}

const TabTitleCounts = styled.span`
  font-size: 0.7em;
`;

const TabTitle = ({title, counts, count, isLoading = false}: TabTitleProps) => {
  const [_] = useTranslation();

  const countLoadingMessage = '...';

  let countLabel;
  if (isLoading || !(isDefined(count) || isDefined(counts))) {
    countLabel = countLoadingMessage;
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

export default TabTitle;
