/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {MantineSpacing, StyleProp} from '@mantine/core';
import {LabelWithIcon as Label} from '@greenbone/opensight-ui-components-mantinev7';
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

const FormGroup = ({
  children,
  title,
  gap = 'md',
  direction = 'column',
  'data-testid': dataTestId,
}: FormGroupProps) => {
  const Layout = direction === 'column' ? Column : Row;
  return (
    <Column
      align="stretch"
      data-testid={dataTestId}
      gap="8"
      justify="flex-start"
    >
      {isDefined(title) && <Label>{title}</Label>}
      <Layout gap={gap}>{children}</Layout>
    </Column>
  );
};

export default FormGroup;
