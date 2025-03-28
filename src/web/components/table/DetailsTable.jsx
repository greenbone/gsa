/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Col from 'web/components/table/Col';
import InfoTable from 'web/components/table/InfoTable';
import PropTypes from 'web/utils/PropTypes';

const DetailsTable = ({children, size = 'full', ...props}) => (
  <InfoTable {...props} size={size}>
    <colgroup>
      <Col width="10%" />
      <Col width="90%" />
    </colgroup>
    {children}
  </InfoTable>
);

DetailsTable.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DetailsTable;
