/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

import InfoTable from './infotable';

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

// vim: set ts=2 sw=2 tw=80:
