/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import InfoTable from 'web/components/table/InfoTable';
import {Col} from 'web/entity/Page';
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
