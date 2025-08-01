/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined, isString} from 'gmp/utils/identity';
import Icon from 'web/components/icon/Icon';
import Layout from 'web/components/layout/Layout';
import withLayout from 'web/components/layout/withLayout';
import Theme from 'web/utils/Theme';

interface SectionHeaderProps {
  align?: string | [string, string];
  alignHeading?: string | [string, string];
  children?: React.ReactNode;
  img?: string | React.ReactNode;
  title?: string | React.ReactNode;
}

const HeaderLayout = styled(Layout)`
  margin: 26px 0px 10px 0px;
  padding-bottom: 15px;
  border-bottom: 2px solid ${Theme.lightGray};
  position: relative;
`;

const HeaderHeading = withLayout()(styled.h2`
  margin: 0 0 1px 0;
`);

HeaderHeading.displayName = 'HeaderHeading';

const HeaderIconLayout = styled(Layout)`
  margin-right: 5px;
`;

const WordBreakLayout = styled(Layout)`
  word-break: break-all;
  min-width: 100px;
`;

const SectionHeader = ({
  children,
  align = ['space-between', 'end'],
  alignHeading = ['start', 'stretch'],
  title,
  img,
}: SectionHeaderProps) => {
  return (
    <HeaderLayout flex align={align} className="section-header">
      <HeaderHeading align={alignHeading}>
        {isDefined(img) && (
          <HeaderIconLayout flex align={['start', 'end']}>
            {isString(img) ? <Icon img={img} size="large" /> : img}
          </HeaderIconLayout>
        )}
        {isDefined(title) && (
          <WordBreakLayout align={['start', 'end']}>{title}</WordBreakLayout>
        )}
      </HeaderHeading>
      {children}
    </HeaderLayout>
  );
};

export default SectionHeader;
