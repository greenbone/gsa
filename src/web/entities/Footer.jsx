/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  showInfoNotification,
  showSuccessNotification,
} from '@greenbone/opensight-ui-components-mantinev7';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/DialogTwoButtonFooter';
import Select from 'web/components/form/Select';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import ExportIcon from 'web/components/icon/ExportIcon';
import TagsIcon from 'web/components/icon/TagsIcon';
import TrashIcon from 'web/components/icon/TrashIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import TableFooter from 'web/components/table/Footer';
import TableRow from 'web/components/table/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';

const DIALOG_TYPES = {
  TRASH: 'trash',
  DELETE: 'delete',
};

export const EntitiesFooter = ({
  actions = true,
  children,
  download,
  selection = true,
  selectionType,
  span,
  tags = true,
  trash,
  onDeleteClick,
  onDownloadClick,
  onSelectionTypeChange,
  onTagsClick,
  onTrashClick,
  dialogConfig = {useCustomDialog: false},
  delete: deleteEntities,
  ...props
}) => {
  const [_] = useTranslation();
  const [configDialog, setConfigDialog] = useState(undefined);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);

  const onIconClick = (type, propOnAction) => {
    if (dialogConfig.useCustomDialog) {
      propOnAction();
      return;
    }

    const configMap = {
      [DIALOG_TYPES.DELETE]: {
        dialogText: _(
          'Are you sure you want to delete all items on this page?\nThis action cannot be undone.',
        ),
        dialogTitle: _('Confirm Deletion'),
        dialogButtonTitle: _('Delete'),
        confirmFunction: async () => {
          try {
            setIsInProgress(true);
            showInfoNotification('', _('Deletion started'));
            await propOnAction();
            showSuccessNotification('', _('Deletion completed'));
          } finally {
            setIsInProgress(false);
          }
        },
      },
      [DIALOG_TYPES.TRASH]: {
        dialogText: _(
          'Are you sure you want to move all items on this page to the trashcan?',
        ),
        dialogTitle: _('Confirm move to trashcan'),
        dialogButtonTitle: _('Move to Trashcan'),
        confirmFunction: async () => {
          try {
            setIsInProgress(true);
            showInfoNotification('', _('Moving to trashcan'));
            await propOnAction();
            showSuccessNotification('', _('Move to trashcan completed'));
          } finally {
            setIsInProgress(false);
          }
        },
      },
    };
    setConfigDialog(configMap[type]);
    setIsDialogVisible(true);
  };

  const closeDialog = () => {
    setIsDialogVisible(false);
    setConfigDialog(undefined);
  };

  const selectItems = [
    {
      value: SelectionType.SELECTION_PAGE_CONTENTS,
      label: _('Apply to page contents'),
    },
    {
      value: SelectionType.SELECTION_USER,
      label: _('Apply to selection'),
    },
    {
      value: SelectionType.SELECTION_FILTER,
      label: _('Apply to all filtered'),
    },
  ];

  return (
    <TableFooter>
      <TableRow>
        <td colSpan={span}>
          {actions ? (
            <Layout align={['end', 'center']}>
              <Divider>
                {selection && (
                  <Select
                    items={selectItems}
                    value={selectionType}
                    onChange={onSelectionTypeChange}
                  />
                )}
                <IconDivider>
                  {tags && (
                    <TagsIcon
                      selectionType={selectionType}
                      onClick={onTagsClick}
                    />
                  )}
                  {trash && (
                    <TrashIcon
                      loading={isInProgress || dialogConfig.dialogProcessing}
                      selectionType={selectionType}
                      onClick={() =>
                        onIconClick(DIALOG_TYPES.TRASH, onTrashClick)
                      }
                    />
                  )}
                  {deleteEntities && (
                    <DeleteIcon
                      loading={isInProgress || dialogConfig.dialogProcessing}
                      selectionType={selectionType}
                      onClick={() =>
                        onIconClick(DIALOG_TYPES.DELETE, onDeleteClick)
                      }
                    />
                  )}
                  {download && (
                    <ExportIcon
                      selectionType={selectionType}
                      value={download}
                      onClick={onDownloadClick}
                    />
                  )}
                  {children}
                </IconDivider>
              </Divider>
            </Layout>
          ) : (
            children
          )}
        </td>
      </TableRow>
      {dialogConfig.useCustomDialog
        ? dialogConfig.customDialogElement
        : isDialogVisible &&
          configDialog && (
            <ConfirmationDialog
              content={configDialog.dialogText}
              rightButtonAction={DELETE_ACTION}
              rightButtonTitle={configDialog.dialogButtonTitle}
              title={configDialog.dialogTitle}
              width="500px"
              onClose={closeDialog}
              onResumeClick={() => {
                configDialog.confirmFunction();
                closeDialog();
              }}
            />
          )}
    </TableFooter>
  );
};

EntitiesFooter.propTypes = {
  actions: PropTypes.bool,
  delete: PropTypes.bool,
  download: PropTypes.stringOrFalse,
  selection: PropTypes.bool,
  selectionType: PropTypes.string,
  span: PropTypes.number.isRequired,
  tags: PropTypes.bool,
  trash: PropTypes.bool,
  onDeleteClick: PropTypes.func,
  onDownloadClick: PropTypes.func,
  onSelectionTypeChange: PropTypes.func,
  onTagsClick: PropTypes.func,
  onTrashClick: PropTypes.func,
  children: PropTypes.node,
  dialogConfig: PropTypes.shape({
    useCustomDialog: PropTypes.bool,
    dialog: PropTypes.element,
  }),
};

export const withEntitiesFooter =
  (options = {}) =>
  Component => {
    const EntitiesFooterWrapper = ({
      onDownloadBulk,
      onDeleteBulk,
      onTagsBulk,
      ...props
    }) => {
      return (
        <Component
          {...options}
          {...props}
          onDeleteClick={onDeleteBulk}
          onDownloadClick={onDownloadBulk}
          onTagsClick={onTagsBulk}
          onTrashClick={onDeleteBulk}
        />
      );
    };

    EntitiesFooterWrapper.propTypes = {
      onDeleteBulk: PropTypes.func,
      onDownloadBulk: PropTypes.func,
      onTagsBulk: PropTypes.func,
    };

    return EntitiesFooterWrapper;
  };

export const createEntitiesFooter = options =>
  withEntitiesFooter(options)(EntitiesFooter);

export default EntitiesFooter;
