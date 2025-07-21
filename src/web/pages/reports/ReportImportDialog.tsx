/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Task from 'gmp/models/task';
import {YES_VALUE, YesNo} from 'gmp/parser';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {NewIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import {RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

interface ReportImportDialogState {
  task_id: string;
}

interface ReportImportDialogDefaultsState {
  in_assets: YesNo;
  xml_file?: File;
}

export type ReportImportDialogData = ReportImportDialogState &
  ReportImportDialogDefaultsState;

interface ReportImportDialogProps {
  in_assets?: YesNo;
  newContainerTask?: boolean;
  task_id: string;
  tasks: Task[];
  onClose: () => void;
  onNewContainerTaskClick?: () => void;
  onSave: (values: ReportImportDialogData) => void;
  onTaskChange?: (taskId: string) => void;
}

const ReportImportDialog = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  in_assets = YES_VALUE,
  newContainerTask = true,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  task_id,
  tasks,
  onClose,
  onNewContainerTaskClick,
  onSave,
  onTaskChange,
}: ReportImportDialogProps) => {
  const [_] = useTranslation();
  return (
    <SaveDialog<ReportImportDialogState, ReportImportDialogDefaultsState>
      buttonTitle={_('Import')}
      defaultValues={{in_assets}}
      title={_('Import Report')}
      values={{task_id}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <>
          <FormGroup title={_('Report')}>
            <FileField grow="1" name="xml_file" onChange={onValueChange} />
          </FormGroup>
          <FormGroup direction="row" title={_('Container Task')}>
            <Select
              grow="1"
              items={renderSelectItems(tasks as RenderSelectItemProps[])}
              name="task_id"
              value={values.task_id}
              onChange={onTaskChange}
            />
            {newContainerTask && (
              <NewIcon
                data-testid="new-container-task"
                title={_('Create new Container Task')}
                onClick={onNewContainerTaskClick}
              />
            )}
          </FormGroup>
          <FormGroup title={_('Add to Assets')}>
            <span>
              {_('Add to Assets with QoD >= 70% and Overrides enabled')}
            </span>
            <YesNoRadio
              name="in_assets"
              value={values.in_assets}
              onChange={onValueChange}
            />
          </FormGroup>
        </>
      )}
    </SaveDialog>
  );
};

export default ReportImportDialog;
