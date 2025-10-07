/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Credential from 'gmp/models/credential';
import {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
  ScannerType,
  scannerTypeName,
} from 'gmp/models/scanner';
import {map} from 'gmp/utils/array';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {NewIcon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

interface ScannerDialogProps {
  comment?: string;
  credentialId?: string;
  credentials?: Credential[];
  host?: string;
  id?: string;
  name?: string;
  port?: number;
  scannerInUse?: boolean;
  title?: string;
  type?: ScannerType;
  onClose?: () => void;
  onCredentialChange?: (value: string) => void;
  onNewCredentialClick?: () => void;
  onSave?: (state: ScannerDialogState) => Promise<void> | void;
  onScannerTypeChange?: (value: ScannerType) => void;
  onScannerPortChange?: (value: number) => void;
}

interface ScannerDialogDefaultValues {
  comment: string;
  host: string;
  id?: string;
  name: string;
}

interface ScannerDialogValues {
  credentialId?: string;
  type?: ScannerType;
  port?: number;
}

export type ScannerDialogState = ScannerDialogValues &
  ScannerDialogDefaultValues;

const ScannerDialog = ({
  comment = '',
  scannerInUse = false,
  credentials = [],
  credentialId,
  host = 'localhost',
  id,
  name,
  port,
  title,
  type,
  onClose,
  onCredentialChange,
  onNewCredentialClick,
  onSave,
  onScannerPortChange,
  onScannerTypeChange,
}: ScannerDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const features = useFeatures();
  const gmp = useGmp();

  name = name || _('Unnamed');
  title = title || _('New Scanner');

  let SCANNER_TYPES: ScannerType[] = [];

  if (
    features.featureEnabled('ENABLE_AGENTS') &&
    capabilities.mayAccess('agent')
  ) {
    type = type ?? AGENT_CONTROLLER_SCANNER_TYPE;
    SCANNER_TYPES.push(AGENT_CONTROLLER_SCANNER_TYPE);
    if (gmp.settings.enableGreenboneSensor) {
      SCANNER_TYPES.push(AGENT_CONTROLLER_SENSOR_SCANNER_TYPE);
    } else if (type === AGENT_CONTROLLER_SENSOR_SCANNER_TYPE) {
      type = undefined;
    }
  } else if (type === AGENT_CONTROLLER_SCANNER_TYPE) {
    type = undefined;
  }
  if (gmp.settings.enableGreenboneSensor) {
    type = type ?? GREENBONE_SENSOR_SCANNER_TYPE;
    SCANNER_TYPES.push(GREENBONE_SENSOR_SCANNER_TYPE);
  } else if (type === GREENBONE_SENSOR_SCANNER_TYPE) {
    type = undefined;
  }

  const scannerTypesOptions = map(SCANNER_TYPES, scannerType => ({
    label: scannerTypeName(scannerType),
    value: scannerType,
  }));

  const isGreenboneSensorType = type === GREENBONE_SENSOR_SCANNER_TYPE;
  const isAgentControllerSensorScannerType =
    type === AGENT_CONTROLLER_SENSOR_SCANNER_TYPE;
  const showCredentialField =
    !isGreenboneSensorType && !isAgentControllerSensorScannerType;
  if (isGreenboneSensorType || isAgentControllerSensorScannerType) {
    credentialId = undefined;
  }

  return (
    <SaveDialog<ScannerDialogValues, ScannerDialogDefaultValues>
      defaultValues={{
        comment,
        host,
        id,
        name,
      }}
      title={title}
      values={{
        credentialId,
        type,
        port,
      }}
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

            <Select
              disabled={scannerInUse}
              items={scannerTypesOptions}
              label={_('Scanner Type')}
              name="type"
              value={state.type}
              onChange={(value: string) =>
                onScannerTypeChange && onScannerTypeChange(value as ScannerType)
              }
            />

            <FormGroup title={_('Host')}>
              <TextField
                disabled={scannerInUse}
                name="host"
                value={state.host}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Port')}>
              <NumberField
                disabled={scannerInUse}
                name="port"
                value={state.port}
                onChange={(value: number) =>
                  onScannerPortChange && onScannerPortChange(value)
                }
              />
            </FormGroup>

            {showCredentialField && (
              <FormGroup direction="row" title={_('Credential')}>
                <Select
                  aria-label={_('Credential')}
                  grow="1"
                  items={renderSelectItems(
                    credentials as RenderSelectItemProps[],
                  )}
                  name="credentialId"
                  value={credentialId}
                  onChange={(value: string) =>
                    onCredentialChange && onCredentialChange(value)
                  }
                />
                <NewIcon
                  title={_('Create a new Credential')}
                  onClick={onNewCredentialClick}
                />
              </FormGroup>
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

export default ScannerDialog;
