/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {MantineSpacing, StyleProp} from '@mantine/core';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';

interface FormGroupProps {
  children?: React.ReactNode;
  'data-testid'?: string;
  direction?: 'row' | 'column';
  gap?: StyleProp<MantineSpacing>;
  title?: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const StyledLabel = styled.label`
  font-weight: 500;
  font-size: var(--mantine-font-size-md);
  color: var(--label-color);
  margin-bottom: 0;
  display: block;
`;

const FormGroup = ({
  children,
  title,
  gap = 'md',
  direction = 'column',
  'data-testid': dataTestId = 'form-group',
}: FormGroupProps) => {
  const Layout = direction === 'column' ? Column : Row;
  return (
    <Wrapper data-testid={dataTestId}>
      {isDefined(title) && (
        <StyledLabel data-testid={`${dataTestId}-label`}>{title}</StyledLabel>
      )}
      <Layout gap={gap}>{children}</Layout>
    </Wrapper>
  );
};

export default FormGroup;
