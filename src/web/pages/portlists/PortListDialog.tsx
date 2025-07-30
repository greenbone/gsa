/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {FROM_FILE, FromFile, NOT_FROM_FILE} from 'gmp/commands/portlists';
import PortList from 'gmp/models/portlist';
import {parseYesNo, YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import TextField from 'web/components/form/TextField';
import {NewIcon} from 'web/components/icon';
import Row from 'web/components/layout/Row';
import Section from 'web/components/section/Section';
import useTranslation from 'web/hooks/useTranslation';
import PortRangesTable, {PortRange} from 'web/pages/portlists/PortRangesTable';
import {useCreatePortsList} from 'web/queries/portlists/useCreatePortslist';

export interface SavePortListData<TPortRange extends PortRange> {
  id?: string;
  comment: string;
  file?: File;
  fromFile: FromFile;
  name: string;
  portRange: string;
  portRanges: TPortRange[];
}

interface PortListsDialogProps<TPortRange extends PortRange> {
  comment?: string;
  fromFile?: FromFile;
  id?: string;
  name?: string;
  portList?: PortList;
  portRange?: string;
  portRanges?: TPortRange[];
  title?: string;
  onClose: () => void;
  onNewPortRangeClick: () => void;
  onSave: (data: SavePortListData<TPortRange>) => void | Promise<void>;
  onTmpDeletePortRange: (portRange: TPortRange) => void;
}

interface PortListDialogValues<TPortRange extends PortRange> {
  file?: File;
  portRanges: TPortRange[];
}

interface PortListsDialogDefaultValues {
  id: string | undefined;
  comment: string;
  fromFile: FromFile;
  name: string;
  portRange: string;
}

const PortListsDialog = <TPortRange extends PortRange>({
  comment = '',
  fromFile = NOT_FROM_FILE,
  id,
  name,
  portList,
  portRange = 'T:1-5,7,9,U:1-3,5,7,9',
  portRanges = [],
  title,
  onClose,
  onNewPortRangeClick,
  onTmpDeletePortRange,
  onSave,
}: PortListsDialogProps<TPortRange>) => {
  const [_] = useTranslation();
  const isEdit = isDefined(portList);
  name = name || _('Unnamed');
  title = title || _('New Port List');

  // Use mutation for create
  const createPortListMutation = useCreatePortsList({
    onSuccess: data => {
      if (onSave) onSave(data as any); // Optionally call onSave for consistency
      onClose();
    },
    onError: error => {
      console.error('Failed to create port list', error);
    },
  });

  const newRangeIcon = (
    <div>
      <NewIcon
        data-testid="new-port-range"
        title={_('Add Port Range')}
        onClick={onNewPortRangeClick}
      />
    </div>
  );

  const data = {
    id,
    comment,
    fromFile,
    name,
    portRange,
  };

  // Extract a human-readable error message
  const err = createPortListMutation.error;
  let dialogError: string | undefined = undefined;
  if (err instanceof Error) {
    dialogError = err.message;
  } else if (err && typeof err === 'object') {
    dialogError =
      (err as any)?.message ||
      (err as any)?.error?.message ||
      JSON.stringify(err);
  } else if (err) {
    dialogError = String(err);
  }

  return (
    <SaveDialog<PortListDialogValues<TPortRange>, PortListsDialogDefaultValues>
      defaultValues={data}
      error={dialogError}
      title={title}
      values={{portRanges}}
      onClose={onClose}
      onSave={formData => {
        if (!isEdit) {
          // Only use mutation for create
          createPortListMutation.mutate({
            name: formData.name,
            comment: formData.comment,
            fromFile: formData.fromFile,
            portRange: formData.portRange,
            file: formData.file ? formData.file.name : undefined,
          });
        }
      }}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <TextField
              name="name"
              title={_('Name')}
              value={state.name}
              onChange={onValueChange}
            />

            <TextField
              name="comment"
              title={_('Comment')}
              value={state.comment}
              onChange={onValueChange}
            />

            {!isEdit && (
              <FormGroup title={_('Port Ranges')}>
                <Row>
                  <Radio<YesNo>
                    checked={parseYesNo(state.fromFile) !== FROM_FILE}
                    name="fromFile"
                    title={_('Manual')}
                    value={NOT_FROM_FILE}
                    onChange={onValueChange}
                  />
                  <TextField
                    disabled={parseYesNo(state.fromFile) === FROM_FILE}
                    grow="1"
                    name="portRange"
                    value={state.portRange}
                    onChange={onValueChange}
                  />
                </Row>
                <Row>
                  <Radio<YesNo>
                    checked={parseYesNo(state.fromFile) === FROM_FILE}
                    name="fromFile"
                    title={_('From file')}
                    value={FROM_FILE}
                    onChange={onValueChange}
                  />
                  <FileField
                    disabled={parseYesNo(state.fromFile) !== FROM_FILE}
                    grow="1"
                    name="file"
                    onChange={onValueChange}
                  />
                </Row>
              </FormGroup>
            )}
            {isEdit && (
              <Section extra={newRangeIcon} title={_('Port Ranges')}>
                {isDefined(portList) && (
                  <PortRangesTable<TPortRange>
                    portRanges={state.portRanges}
                    onDeleteClick={onTmpDeletePortRange}
                  />
                )}
              </Section>
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

export default PortListsDialog;
