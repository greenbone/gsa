/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/DialogTwoButtonFooter';
import DialogNotification from 'web/components/notification/DialogNotification';
import actionFunction from 'web/entity/hooks/action-function';
import {useDeleteKey, useGetKey} from 'web/hooks/use-query/feed-key';
import useTranslation from 'web/hooks/useTranslation';
import FeedKeyUploadDialog from 'web/pages/feed-configuration/FeedKeyUploadDialog';

interface FeedKeyContextValue {
  keyData?: string;
  isLoading: boolean;
  hasKey: boolean;
  deleteKey: () => void;
  uploadKey: () => void;
  isDeleting: boolean;
}

interface FeedKeyProviderProps {
  children: React.ReactNode;
  onDeleted?: () => void;
  onDeleteError?: (error: Error) => void;
  onUploaded?: () => void;
  onUploadError?: (error: Error) => void;
}

const FeedKeyContext = createContext<FeedKeyContextValue | undefined>(
  undefined,
);

export const useFeedKey = (): FeedKeyContextValue => {
  const context = useContext(FeedKeyContext);
  if (!context) {
    throw new Error('useFeedKey must be used within a FeedKeyProvider');
  }
  return context;
};

export const FeedKeyProvider = ({
  children,
  onDeleted,
  onDeleteError,
  onUploaded,
  onUploadError,
}: FeedKeyProviderProps) => {
  const [_] = useTranslation();

  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {data: keyData, isLoading, error} = useGetKey();
  const deleteKeyMutation = useDeleteKey();

  const hasKey = Boolean(keyData) && !error;

  const handleDeleteClick = useCallback(() => {
    setDeleteConfirmVisible(true);
  }, []);

  const handleConfirmDelete = async () => {
    await actionFunction(deleteKeyMutation.mutateAsync(), {
      onSuccess: async () => {
        setDeleteConfirmVisible(false);
        onDeleted?.();
      },
      successMessage: _('Key deleted successfully'),
      onError: async error => {
        setDeleteConfirmVisible(false);
        const errorMsg = _('Failed to delete key: {{error}}', {
          error: error instanceof Error ? error.message : String(error),
        });
        setErrorMessage(errorMsg);
        onDeleteError?.(error);
      },
    });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmVisible(false);
  };

  const handleUploadClick = useCallback(() => {
    setUploadDialogVisible(true);
  }, []);

  const handleUploadSuccess = async () => {
    setUploadDialogVisible(false);
    onUploaded?.();
  };

  const handleUploadError = (err: Error) => {
    const errorMsg = _('Failed to upload key: {{error}}', {
      error: err.message,
    });
    setErrorMessage(errorMsg);
    onUploadError?.(err);
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogVisible(false);
  };

  const value: FeedKeyContextValue = useMemo(
    () => ({
      keyData,
      isLoading,
      hasKey,
      deleteKey: handleDeleteClick,
      uploadKey: handleUploadClick,
      isDeleting: deleteKeyMutation.isPending,
    }),
    [
      keyData,
      isLoading,
      hasKey,
      handleDeleteClick,
      handleUploadClick,
      deleteKeyMutation.isPending,
    ],
  );

  return (
    <FeedKeyContext.Provider value={value}>
      {children}
      {errorMessage && (
        <DialogNotification
          message={errorMessage}
          onCloseClick={handleCloseError}
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
          onClose={handleCancelDelete}
          onResumeClick={handleConfirmDelete}
        />
      )}
      {uploadDialogVisible && (
        <FeedKeyUploadDialog
          onClose={handleCloseUploadDialog}
          onError={handleUploadError}
          onSuccess={handleUploadSuccess}
        />
      )}
    </FeedKeyContext.Provider>
  );
};
