/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Button from 'web/components/form/button';
import Layout from 'web/components/layout/layout';
import PropTypes from 'web/utils/proptypes';

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
    data-testid={dataTestId}
    shrink="0"
  >
    <Button isLoading={isLoading} title={title} onClick={onClick}>
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
