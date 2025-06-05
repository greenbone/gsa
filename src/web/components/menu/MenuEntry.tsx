/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import useClickHandler from 'web/components/form/useClickHandler';
import Layout, {LayoutProps} from 'web/components/layout/Layout';
import Link from 'web/components/link/Link';

const StyledLink = styled(Link)`
  height: 100%;
`;

interface NameValueProps<TValue> {
  name?: string;
  value?: TValue;
}

interface MenuEntryProps<TValue>
  extends Omit<LayoutProps, 'onClick' | 'align' | 'grow' | 'title'>,
    NameValueProps<TValue> {
  title?: React.ReactNode;
  to?: string;
  onClick?: (value: TValue, name?: string) => void;
}

const MenuEntry = <TValue,>({
  children,
  title = children,
  to,
  onClick,
  ...props
}: MenuEntryProps<TValue>) => {
  const handleClick = useClickHandler<
    NameValueProps<TValue>,
    TValue,
    React.MouseEvent<HTMLDivElement>
  >({
    valueFunc: (_event, props) => props.value as TValue,
    nameFunc: (_event, props) => props.name,
    onClick,
    props,
  });
  return (
    <Layout
      {...props}
      align={['start', 'center']}
      grow="1"
      onClick={handleClick}
    >
      {isDefined(to) ? <StyledLink to={to}>{title}</StyledLink> : title}
    </Layout>
  );
};

export default MenuEntry;
