/* Copyright (C) 2016-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
