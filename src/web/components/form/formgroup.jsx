/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {LabelWithIcon as Label} from '@greenbone/opensight-ui-components';

import {isDefined} from 'gmp/utils/identity';

import Row from 'web/components/layout/row';
import Column from 'web/components/layout/column';

import PropTypes from 'web/utils/proptypes';

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
      justify="flex-start"
      gap="0"
      data-testid={dataTestId}
    >
      {isDefined(title) && <Label>{title}</Label>}
      <Layout gap={gap}>{children}</Layout>
    </Column>
  );
};

FormGroup.propTypes = {
  'data-testid': PropTypes.string,
  direction: PropTypes.oneOf(['row', 'column']),
  gap: PropTypes.string,
  title: PropTypes.string,
};

export default FormGroup;

// vim: set ts=2 sw=2 tw=80:
