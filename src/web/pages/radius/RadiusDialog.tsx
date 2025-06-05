/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import SaveDialog from 'web/components/dialog/SaveDialog';
import CheckBox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import PasswordField from 'web/components/form/PasswordField';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';

interface RadiusDialogProps {
  radiusEnabled?: boolean;
  radiusHost?: string;
  onClose: () => void;
  onSave: (values: {
    radiusEnabled: boolean;
    radiusHost: string;
    radiusKey: string;
  }) => void;
}

const RadiusDialog = ({
  radiusEnabled = false,
  radiusHost = '',
  onClose,
  onSave,
}: RadiusDialogProps) => {
  const [_] = useTranslation();
  const uncontrolledValues = {
    radiusEnabled,
    radiusHost,
    radiusKey: '',
  };
  return (
    <SaveDialog
      buttonTitle={_('Save')}
      defaultValues={uncontrolledValues}
      title={_('Edit RADIUS Authentication')}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <>
          <CheckBox<boolean>
            checked={values.radiusEnabled}
            checkedValue={true}
            data-testid="enable-checkbox"
            name="radiusEnabled"
            title={_('Enable')}
            unCheckedValue={false}
            onChange={onValueChange}
          />
          <FormGroup title={_('RADIUS Host')}>
            <TextField
              data-testid="radiushost-textfield"
              grow="1"
              name="radiusHost"
              value={values.radiusHost}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Secret Key')}>
            <PasswordField
              data-testid="radiuskey-textfield"
              grow="1"
              name="radiusKey"
              value={values.radiusKey}
              onChange={onValueChange}
            />
          </FormGroup>
        </>
      )}
    </SaveDialog>
  );
};

export default RadiusDialog;
