/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

import Layout from 'web/components/layout/layout';

import Button from 'web/components/form/button';

export const DialogFooterLayout = styled(Layout)`
  margin-top: 15px;
  padding: 10px 0px 0px 0px;
  gap: 10px;
`;

const DialogFooter = ({
  title,
  onClick,
  loading = false,
  isLoading = loading,
  'data-testid': dataTestId,
}) => (
  <DialogFooterLayout
    align={['end', 'center']}
    shrink="0"
    data-testid={dataTestId}
  >
    <Button onClick={onClick} title={title} isLoading={isLoading}>
      {title}
    </Button>
  </DialogFooterLayout>
);

DialogFooter.propTypes = {
  'data-testid': PropTypes.string,
  isLoading: PropTypes.bool,
  loading: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default DialogFooter;

// vim: set ts=2 sw=2 tw=80:
