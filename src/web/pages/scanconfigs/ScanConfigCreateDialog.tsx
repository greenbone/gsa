/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type default as ScanConfig,
  BASE_SCAN_CONFIG_ID,
} from 'gmp/models/scan-config';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import {type RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

interface ScanConfigCreateData {
  baseScanConfig: string;
  comment?: string;
  name: string;
}

interface ScanConfigCreateDialogProps {
  baseScanConfig?: string;
  comment?: string;
  name?: string;
  scanConfigs?: ScanConfig[];
  title?: string;
  onClose: () => void;
  onSave: (values: ScanConfigCreateData) => void;
}

const ScanConfigCreateDialog = ({
  baseScanConfig = BASE_SCAN_CONFIG_ID,
  comment = '',
  name,
  scanConfigs = [],
  title,
  onClose,
  onSave,
}: ScanConfigCreateDialogProps) => {
  const [_] = useTranslation();
  name = name || _('Unnamed');
  title = title || _('New Scan Config');
  const defaultValues = {
    baseScanConfig,
    comment,
    name,
  };
  return (
    <SaveDialog<{}, ScanConfigCreateData>
      defaultValues={defaultValues}
      title={title}
      width="auto"
      onClose={onClose}
      onSave={onSave}
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

            <Select
              disabled={scanConfigs.length === 0}
              grow="1"
              items={renderSelectItems(scanConfigs as RenderSelectItemProps[])}
              label={_('Template')}
              name="baseScanConfig"
              value={state.baseScanConfig}
              onChange={onValueChange}
            />
          </>
        );
      }}
    </SaveDialog>
  );
};

export default ScanConfigCreateDialog;
