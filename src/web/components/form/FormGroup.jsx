/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {LabelWithIcon as Label} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import PropTypes from 'web/utils/PropTypes';

const FormGroup = ({
  children,
  title,
  gap = 'md',
  direction = 'column',
  'data-testid': dataTestId,
}) => {
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

FormGroup.propTypes = {
  children: PropTypes.node,
  'data-testid': PropTypes.string,
  direction: PropTypes.oneOf(['row', 'column']),
  gap: PropTypes.string,
  title: PropTypes.string,
};

export default FormGroup;
