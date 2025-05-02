/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ProtocolType} from 'gmp/models/portlist';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import Radio from 'web/components/form/Radio';
import useTranslation from 'web/hooks/useTranslation';

export interface PortRangeDialogData {
  portListId: string;
  portRangeStart: number;
  portRangeEnd: number;
  portType: ProtocolType;
}

interface PortRangeDialogProps {
  portListId: string;
  portType?: ProtocolType;
  title?: string;
  onClose: () => void;
  onSave: (data: PortRangeDialogData) => void;
}

const PortRangeDialog = ({
  portListId,
  portType = 'tcp',
  title,
  onClose,
  onSave,
}: PortRangeDialogProps) => {
  const [_] = useTranslation();

  title = title || _('New Port Range');

  const data = {
    portListId,
    portRangeStart: '',
    portRangeEnd: '',
    portType,
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
              <NumberField
                name="portRangeStart"
                type="int"
                value={state.portRangeStart}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('End')}>
              <NumberField
                name="portRangeEnd"
                type="int"
                value={state.portRangeEnd}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup direction="row" title={_('Protocol')}>
              {/* @ts-expect-error */}
              <Radio
                checked={state.portType === 'tcp'}
                name="portType"
                title={_('TCP')}
                value="tcp"
                onChange={onValueChange}
              />
              {/* @ts-expect-error */}
              <Radio
                checked={state.portType === 'udp'}
                name="portType"
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
