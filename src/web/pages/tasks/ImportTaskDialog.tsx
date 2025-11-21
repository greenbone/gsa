/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Task from 'gmp/models/task';
import {YES_VALUE, type YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import AddResultsToAssetsGroup from 'web/pages/tasks/AddResultsToAssetsGroup';

interface ImportTaskDialogState {
  comment: string;
  in_assets: YesNo;
  name: string;
  id?: string;
}

export type ImportTaskDialogData = ImportTaskDialogState;

interface ImportTaskDialogProps {
  comment?: string;
  in_assets?: YesNo;
  name?: string;
  task?: Task;
  title?: string;
  onClose: () => void | Promise<void>;
  onSave: (data: ImportTaskDialogData) => void | Promise<void>;
}

const ImportTaskDialog = ({
  comment = '',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  in_assets = YES_VALUE,
  name = '',
  task,
  title,
  onClose,
  onSave,
}: ImportTaskDialogProps) => {
  const [_] = useTranslation();
  const isEdit = isDefined(task);

  title = title || _('New Import Task');

  const data: ImportTaskDialogState = {
    comment,
    in_assets,
    name,
    id: isEdit ? task.id : undefined,
  };

  return (
    <SaveDialog<{}, ImportTaskDialogState>
      defaultValues={data}
      title={title}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>
            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            {isEdit && (
              <AddResultsToAssetsGroup
                inAssets={state.in_assets}
                onChange={onValueChange}
              />
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

export default ImportTaskDialog;
