/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PortList from 'gmp/models/portlist';
import {NO_VALUE, YES_VALUE, parseYesNo} from 'gmp/parser';
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
const FROM_FILE = YES_VALUE;
const NOT_FROM_FILE = NO_VALUE;

interface SaveDialogData {
  id?: string;
  comment: string;
  from_file: typeof FROM_FILE | typeof NOT_FROM_FILE;
  name: string;
  port_range: string;
  port_ranges: PortRange[];
}

interface PortListsDialogProps {
  comment?: string;
  from_file?: typeof FROM_FILE | typeof NOT_FROM_FILE;
  id?: string;
  name?: string;
  port_list?: PortList;
  port_range?: string;
  port_ranges?: PortRange[];
  title?: string;
  onClose: () => void;
  onNewPortRangeClick: () => void;
  onSave: (data: SaveDialogData) => void | Promise<void>;
  onTmpDeletePortRange: (portRange: PortRange) => void;
}

const PortListsDialog = ({
  comment = '',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  from_file = NO_VALUE,
  id,
  name,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  port_list,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  port_range = 'T:1-5,7,9,U:1-3,5,7,9',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  port_ranges = [],
  title,
  onClose,
  onNewPortRangeClick,
  onTmpDeletePortRange,
  onSave,
}: PortListsDialogProps) => {
  const [_] = useTranslation();
  const isEdit = isDefined(port_list);
  name = name || _('Unnamed');
  title = title || _('New Port List');

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
    from_file,
    name,
    port_range,
  };

  return (
    <SaveDialog
      defaultValues={data}
      title={title}
      values={{port_ranges}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            {/* @ts-expect-error */}
            <TextField
              name="name"
              title={_('Name')}
              value={state.name}
              onChange={onValueChange}
            />

            {/* @ts-expect-error */}
            <TextField
              name="comment"
              title={_('Comment')}
              value={state.comment}
              onChange={onValueChange}
            />

            {!isEdit && (
              <FormGroup title={_('Port Ranges')}>
                <Row>
                  {/* @ts-expect-error */}
                  <Radio
                    checked={parseYesNo(state.from_file) !== FROM_FILE}
                    name="from_file"
                    title={_('Manual')}
                    value={NOT_FROM_FILE}
                    onChange={onValueChange}
                  />
                  {/* @ts-expect-error */}
                  <TextField
                    disabled={parseYesNo(state.from_file) === FROM_FILE}
                    grow="1"
                    name="port_range"
                    value={state.port_range}
                    onChange={onValueChange}
                  />
                </Row>
                <Row>
                  {/* @ts-expect-error */}
                  <Radio
                    checked={parseYesNo(state.from_file) === FROM_FILE}
                    name="from_file"
                    title={_('From file')}
                    value={FROM_FILE}
                    onChange={onValueChange}
                  />
                  {/* @ts-expect-error */}
                  <FileField
                    disabled={parseYesNo(state.from_file) !== FROM_FILE}
                    grow="1"
                    name="file"
                    onChange={onValueChange}
                  />
                </Row>
              </FormGroup>
            )}
            {isEdit && (
              <Section extra={newRangeIcon} title={_('Port Ranges')}>
                {isDefined(port_list) && (
                  <PortRangesTable
                    portRanges={state.port_ranges}
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
