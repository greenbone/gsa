/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import styled from 'styled-components';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/DialogTwoButtonFooter';
import Button from 'web/components/form/Button';
import {VerifyIcon, VerifyNoIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import DialogNotification from 'web/components/notification/DialogNotification';
import actionFunction from 'web/entity/hooks/action-function';
import {useDeleteKey, useGetKeyStatus} from 'web/hooks/use-query/feed-key';
import useTranslation from 'web/hooks/useTranslation';
import FeedKeyUploadDialog from 'web/pages/feed-configuration/FeedKeyUploadDialog';
import Theme from 'web/utils/Theme';

const FeedKeyCard = styled(Layout)`
  background: ${Theme.white};
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 8px;
  padding: 24px;
  gap: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const IconContainer = styled.div<{$hasKey: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({$hasKey}) => ($hasKey ? Theme.lightGreen : Theme.lightGray)};
  color: ${({$hasKey}) => ($hasKey ? Theme.green : Theme.mediumGray)};
  flex-shrink: 0;
`;

const Title = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${Theme.mediumGray};
`;

const FeedKeyTab = () => {
  const [_] = useTranslation();

  const {data, isLoading, error} = useGetKeyStatus();
  const deleteKeyMutation = useDeleteKey();

  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasKey = data?.hasKey === true && !error;

  const handleDeleteClick = () => {
    setDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    await actionFunction(deleteKeyMutation.mutateAsync(), {
      onSuccess: async () => {
        setDeleteConfirmVisible(false);
      },
      successMessage: _('Key deleted successfully'),
      onError: async deleteError => {
        setDeleteConfirmVisible(false);
        setErrorMessage(
          _('Failed to delete key: {{error}}', {
            error:
              deleteError instanceof Error
                ? deleteError.message
                : String(deleteError),
          }),
        );
      },
    });
  };

  const handleUploadSuccess = () => {
    setUploadDialogVisible(false);
  };

  const handleUploadError = (err: Error) => {
    setErrorMessage(_('Failed to upload key: {{error}}', {error: err.message}));
  };

  if (isLoading) {
    return <Loading />;
  }

  const feedKeyData = hasKey
    ? {
        icon: <VerifyIcon size="large" />,
        title: _('Feed Key Active'),
        description: _(
          'Your feed key is properly configured and active. Enterprise Feed features are available.',
        ),
        action: (
          <Button
            disabled={deleteKeyMutation.isPending}
            title={_('Delete Feed Key')}
            variant="danger"
            onClick={handleDeleteClick}
          >
            {deleteKeyMutation.isPending ? _('Deleting') : _('Delete Key')}
          </Button>
        ),
      }
    : {
        icon: <VerifyNoIcon size="large" />,
        title: _('No Feed Key Configured'),
        description: _(
          'Upload a feed key to enable Enterprise Feed features and content updates.',
        ),
        action: (
          <Button
            color="green"
            title={_('Upload Feed Key')}
            variant="filled"
            onClick={() => setUploadDialogVisible(true)}
          >
            {_('Upload Key')}
          </Button>
        ),
      };

  return (
    <>
      <FeedKeyCard align={['start', 'center']}>
        <IconContainer $hasKey={hasKey}>{feedKeyData.icon}</IconContainer>

        <Layout grow flex="column">
          <Title>{feedKeyData.title}</Title>
          <Description>{feedKeyData.description}</Description>
        </Layout>

        {feedKeyData.action}
      </FeedKeyCard>

      {errorMessage && (
        <DialogNotification
          message={errorMessage}
          onCloseClick={() => setErrorMessage(null)}
        />
      )}
      {deleteConfirmVisible && (
        <ConfirmationDialog
          content={_(
            'Are you sure you want to delete the feed key? This action cannot be undone.',
          )}
          loading={deleteKeyMutation.isPending}
          rightButtonAction={DELETE_ACTION}
          rightButtonTitle={_('Delete')}
          title={_('Delete Feed Key')}
          onClose={() => setDeleteConfirmVisible(false)}
          onResumeClick={handleConfirmDelete}
        />
      )}
      {uploadDialogVisible && (
        <FeedKeyUploadDialog
          onClose={() => setUploadDialogVisible(false)}
          onError={handleUploadError}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default FeedKeyTab;
