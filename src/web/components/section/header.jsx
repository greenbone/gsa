/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, isString} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import Icon from 'web/components/icon/icon';
import Layout from 'web/components/layout/layout';
import withLayout from 'web/components/layout/withLayout';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';



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

const WordbreakLayout = styled(Layout)`
  word-break: break-all;
  min-width: 100px;
`;

const SectionHeader = ({
  children,
  align = ['space-between', 'end'],
  title,
  img,
}) => {
  return (
    <HeaderLayout flex align={align} className="section-header">
      <HeaderHeading align={['start', 'stretch']}>
        {isDefined(img) && (
          <HeaderIconLayout flex align={['start', 'end']}>
            {isString(img) ? <Icon img={img} size="large" /> : img}
          </HeaderIconLayout>
        )}
        {isDefined(title) && (
          <WordbreakLayout align={['start', 'end']}>{title}</WordbreakLayout>
        )}
      </HeaderHeading>
      {children}
    </HeaderLayout>
  );
};

SectionHeader.propTypes = {
  align: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  img: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

export default SectionHeader;

// vim: set ts=2 sw=2 tw=80:
