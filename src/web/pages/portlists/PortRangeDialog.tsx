/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ProtocolType} from 'gmp/models/portlist';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import Radio from 'web/components/form/Radio';
import useTranslation from 'web/hooks/useTranslation';

export interface PortRangeDialogData {
  portListId: string;
  portRangeStart: number | undefined;
  portRangeEnd: number | undefined;
  portType: ProtocolType;
}

interface PortRangeDialogProps {
  portListId: string;
  portType?: ProtocolType;
  title?: string;
  onClose: () => void;
  onSave: (data: PortRangeDialogData) => void;
}

interface PortRangeDialogDefaultValues {
  portListId: string;
  portRangeStart: number | undefined;
  portRangeEnd: number | undefined;
  portType: ProtocolType;
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
    portRangeStart: undefined,
    portRangeEnd: undefined,
    portType,
  };

  return (
    <SaveDialog<{}, PortRangeDialogDefaultValues>
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
              <Radio<'tcp' | 'udp'>
                checked={state.portType === 'tcp'}
                name="portType"
                title={_('TCP')}
                value="tcp"
                onChange={onValueChange}
              />
              <Radio<'tcp' | 'udp'>
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
