/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Button from 'web/components/form/Button';
import Layout from 'web/components/layout/Layout';

export const DialogFooterLayout = styled(Layout)`
  margin-top: 15px;
  padding: 10px 0px 0px 0px;
  gap: 10px;
`;

interface DialogFooterProps {
  title: string;
  onClick?: () => void;
  loading?: boolean;
  isLoading?: boolean;
  'data-testid'?: string;
}

const DialogFooter = ({
  title,
  onClick,
  loading = false,
  isLoading = loading,
  'data-testid': dataTestId,
}: DialogFooterProps) => (
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

export default DialogFooter;
