/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Task from 'gmp/models/task';
import {YES_VALUE, YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import AddResultsToAssetsGroup from 'web/pages/tasks/AddResultsToAssetsGroup';

interface ContainerTaskDialogState {
  comment: string;
  in_assets: YesNo;
  name: string;
  id?: string;
}

export type ContainerTaskDialogData = ContainerTaskDialogState;

interface ContainerTaskDialogProps {
  comment?: string;
  in_assets?: YesNo;
  name?: string;
  task?: Task;
  title?: string;
  onClose: () => void | Promise<void>;
  onSave: (data: ContainerTaskDialogData) => void | Promise<void>;
}

const ContainerTaskDialog = ({
  comment = '',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  in_assets = YES_VALUE,
  name = '',
  task,
  title,
  onClose,
  onSave,
}: ContainerTaskDialogProps) => {
  const [_] = useTranslation();
  const isEdit = isDefined(task);

  title = title || _('New Container Task');

  const data: ContainerTaskDialogState = {
    comment,
    in_assets,
    name,
    id: isEdit ? task.id : undefined,
  };

  return (
    <SaveDialog<{}, ContainerTaskDialogState>
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

export default ContainerTaskDialog;
