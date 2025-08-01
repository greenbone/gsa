/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  showInfoNotification,
  showSuccessNotification,
} from '@greenbone/opensight-ui-components-mantinev7';
import Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';
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
import TableFooter from 'web/components/table/TableFooter';
import TableRow from 'web/components/table/TableRow';
import {WithEntitiesFooterComponentProps} from 'web/entities/withEntitiesFooter';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {SelectionTypeType} from 'web/utils/SelectionType';

type DialogType = (typeof DIALOG_TYPES)[keyof typeof DIALOG_TYPES];

interface DialogConfig {
  useCustomDialog: boolean;
  customDialogElement?: React.ReactElement | null;
  dialogProcessing?: boolean;
}

interface ConfigDialog {
  dialogText: string;
  dialogTitle: string;
  dialogButtonTitle: string;
  confirmFunction: () => Promise<void>;
}

export interface EntitiesFooterProps<TEntity>
  extends WithEntitiesFooterComponentProps<TEntity> {
  actions?: boolean;
  children?: React.ReactNode;
  'data-testid'?: string;
  delete?: boolean;
  dialogConfig?: DialogConfig;
  download?: string;
  selection?: boolean;
  selectionType?: SelectionTypeType;
  span?: number;
  tags?: boolean;
  trash?: boolean;
  onSelectionTypeChange?: (selectionType: SelectionTypeType) => void;
}

const DIALOG_TYPES = {
  TRASH: 'trash',
  DELETE: 'delete',
} as const;

const EntitiesFooter = <TEntity = Model,>({
  actions = true,
  children,
  'data-testid': dataTestId = 'entities-footer',
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
}: EntitiesFooterProps<TEntity>) => {
  const [_] = useTranslation();
  const [configDialog, setConfigDialog] = useState<ConfigDialog | undefined>(
    undefined,
  );
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);

  const onIconClick = (
    type: DialogType,
    propOnAction?: () => void | Promise<void>,
  ) => {
    if (dialogConfig.useCustomDialog) {
      if (isDefined(propOnAction)) {
        void propOnAction();
      }
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
            if (isDefined(propOnAction)) {
              await propOnAction();
            }
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
            if (isDefined(propOnAction)) {
              await propOnAction();
            }
            showSuccessNotification('', _('Move to trashcan completed'));
          } finally {
            setIsInProgress(false);
          }
        },
      },
    } as const;
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
    <TableFooter data-testid={dataTestId}>
      <TableRow>
        <td colSpan={span}>
          {actions ? (
            <Layout align={['end', 'center']}>
              <Divider>
                {selection && (
                  <Select
                    data-testid={`${dataTestId}-select`}
                    items={selectItems}
                    value={selectionType}
                    onChange={
                      onSelectionTypeChange as (
                        value: string,
                        name?: string,
                      ) => void
                    }
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
                      onClick={
                        onDownloadClick as (
                          value?: string,
                          name?: string,
                        ) => void
                      }
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
                void configDialog.confirmFunction();
                closeDialog();
              }}
            />
          )}
    </TableFooter>
  );
};

export default EntitiesFooter;
