/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import ConfirmationDialog from 'web/components/dialog/confirmationdialog';
import {DELETE_ACTION} from 'web/components/dialog/twobuttonfooter';
import Select from 'web/components/form/select';
import DeleteIcon from 'web/components/icon/deleteicon';
import ExportIcon from 'web/components/icon/exporticon';
import TagsIcon from 'web/components/icon/tagsicon';
import TrashIcon from 'web/components/icon/trashicon';
import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import TableFooter from 'web/components/table/footer';
import TableRow from 'web/components/table/row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import SelectionType from 'web/utils/selectiontype';

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
  isGenericBulkTrashcanDeleteDialog,
  delete: deleteEntities,
}) => {
  const [_] = useTranslation();
  const [configDialog, setConfigDialog] = useState(undefined);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const onIconClick = (type, propOnAction) => {
    if (!isGenericBulkTrashcanDeleteDialog) {
      propOnAction();
      return;
    }

    const configMap = {
      [DIALOG_TYPES.DELETE]: {
        dialogText: _(
          'Are you sure you want to delete all rows in the page of the table?\n This action cannot be undone.',
        ),
        dialogTitle: _('Confirm Deletion'),
        dialogButtonTitle: _('Delete'),
        dialogFunction: propOnAction,
      },
      [DIALOG_TYPES.TRASH]: {
        dialogText: _(
          'Are you sure you want to move all rows in the page of the table to the trashcan?',
        ),
        dialogTitle: _('Confirm Move to Trashcan'),
        dialogButtonTitle: _('Move to Trashcan'),
        dialogFunction: propOnAction,
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
                      selectionType={selectionType}
                      onClick={() =>
                        onIconClick(DIALOG_TYPES.TRASH, onTrashClick)
                      }
                    />
                  )}
                  {deleteEntities && (
                    <DeleteIcon
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
      {isDialogVisible && (
        <ConfirmationDialog
          content={configDialog.dialogText}
          rightButtonAction={DELETE_ACTION}
          rightButtonTitle={configDialog.dialogButtonTitle}
          title={configDialog.dialogTitle}
          width="500px"
          onClose={closeDialog}
          onResumeClick={() => {
            configDialog.dialogFunction();
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
  isGenericBulkTrashcanDeleteDialog: PropTypes.bool,
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
