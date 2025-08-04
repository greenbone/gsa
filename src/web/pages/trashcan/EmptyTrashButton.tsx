/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Button from 'web/components/form/Button';
import Layout from 'web/components/layout/Layout';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface EmptyTrashButtonProps {
  onClick: () => void;
}

const EmptyTrashButton = ({onClick}: EmptyTrashButtonProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  if (!capabilities.mayOp('empty_trashcan')) {
    return null;
  }
  return (
    <Layout align="end">
      <Button onClick={onClick}>{_('Empty Trash')}</Button>
    </Layout>
  );
};

export default EmptyTrashButton;
