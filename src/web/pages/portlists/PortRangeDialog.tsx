/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt} from 'gmp/parser';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';

const convertPort = (value: string | number | undefined) =>
  value === '' ? value : parseInt(value);

export interface PortRangeDialogData {
  id: string;
  port_range_start: string;
  port_range_end: string;
  port_type: string;
}

interface PortRangeDialogProps {
  id: string;
  port_type?: string;
  title?: string;
  onClose: () => void;
  onSave: (data: PortRangeDialogData) => void;
}

const PortRangeDialog: React.FC<PortRangeDialogProps> = ({
  id,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  port_type = 'tcp',
  title,
  onClose,
  onSave,
}: PortRangeDialogProps) => {
  const [_] = useTranslation();

  title = title || _('New Port Range');

  const data = {
    id,
    port_range_start: '',
    port_range_end: '',
    port_type,
  };

  return (
    <SaveDialog
      defaultValues={data}
      title={title}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Start')}>
              {/* @ts-expect-error */}
              <TextField
                convert={convertPort}
                name="port_range_start"
                value={state.port_range_start}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('End')}>
              {/* @ts-expect-error */}
              <TextField
                convert={convertPort}
                name="port_range_end"
                value={state.port_range_end}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup direction="row" title={_('Protocol')}>
              {/* @ts-expect-error */}
              <Radio
                checked={state.port_type === 'tcp'}
                name="port_type"
                title={_('TCP')}
                value="tcp"
                onChange={onValueChange}
              />
              {/* @ts-expect-error */}
              <Radio
                checked={state.port_type === 'udp'}
                name="port_type"
                title={_('UDP')}
                value="udp"
                onChange={onValueChange}
              />
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

export default PortRangeDialog;
