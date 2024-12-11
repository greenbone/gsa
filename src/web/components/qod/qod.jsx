/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

const Span = styled.span`
  white-space: nowrap;
`;

const Qod = ({value}) => <Span data-testid="qod">{value} %</Span>;

Qod.propTypes = {
  value: PropTypes.numberOrNumberString.isRequired,
};

export default Qod;

// vim: set ts=2 sw=2 tw=80:
