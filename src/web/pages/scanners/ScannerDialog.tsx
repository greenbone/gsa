/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type Credential from 'gmp/models/credential';
import {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
  CONTAINER_IMAGE_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
  OPENVAS_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
  type ScannerType,
  scannerTypeName,
} from 'gmp/models/scanner';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {NewIcon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {type RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

interface ScannerDialogProps {
  comment?: string;
  caCertificate?: File;
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
}

interface ScannerDialogDefaultValues {
  comment: string;
  host: string;
  id?: string;
  name: string;
}

interface ScannerDialogValues {
  caCertificate?: File;
  credentialId?: string;
  type?: ScannerType;
  port: number | '';
}

export type ScannerDialogState = ScannerDialogValues &
  ScannerDialogDefaultValues;

const CA_CERTIFICATE_LINE = '-----BEGIN CERTIFICATE-----';

const updatePort = (scannerType: ScannerType | undefined) => {
  if (
    scannerType === GREENBONE_SENSOR_SCANNER_TYPE ||
    scannerType === AGENT_CONTROLLER_SENSOR_SCANNER_TYPE
  ) {
    return 22;
  }
  if (
    scannerType === AGENT_CONTROLLER_SCANNER_TYPE ||
    scannerType === OPENVASD_SCANNER_TYPE ||
    scannerType === CONTAINER_IMAGE_SCANNER_TYPE
  ) {
    return 443;
  }
  return '';
};

const ScannerDialog = ({
  comment = '',
  scannerInUse = false,
  caCertificate: initialCaCertificate,
  credentials = [],
  credentialId,
  host = 'localhost',
  id,
  name,
  port,
  title,
  type: initialScannerType,
  onClose,
  onCredentialChange,
  onNewCredentialClick,
  onSave,
}: ScannerDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const features = useFeatures();
  const gmp = useGmp();
  const [caCertificate, setCaCertificate] = useState<File | undefined>(
    initialCaCertificate,
  );
  const [error, setError] = useState<string | undefined>();
  const [scannerType, setScannerType] = useState<ScannerType | undefined>(
    () => {
      if (isDefined(id)) {
        // don't change the type of existing scanners
        return initialScannerType;
      }

      if (
        !isDefined(initialScannerType) &&
        gmp.settings.enableGreenboneSensor
      ) {
        return GREENBONE_SENSOR_SCANNER_TYPE;
      }

      // don't allow selecting agent types initially if the feature is disabled or the user has no access
      if (
        (!features.featureEnabled('ENABLE_AGENTS') ||
          !capabilities.mayAccess('agent')) &&
        (initialScannerType === AGENT_CONTROLLER_SCANNER_TYPE ||
          initialScannerType === AGENT_CONTROLLER_SENSOR_SCANNER_TYPE)
      ) {
        return undefined;
      }

      // don't allow selecting sensor types initially if the setting is disabled
      if (
        !gmp.settings.enableGreenboneSensor &&
        (initialScannerType === GREENBONE_SENSOR_SCANNER_TYPE ||
          initialScannerType === AGENT_CONTROLLER_SENSOR_SCANNER_TYPE)
      ) {
        return undefined;
      }

      if (
        !features.featureEnabled('ENABLE_OPENVASD') &&
        initialScannerType === OPENVASD_SCANNER_TYPE
      ) {
        return undefined;
      }
      return initialScannerType;
    },
  );
  const [userChangedPort, setUserChangedPort] = useState<boolean>(false);
  const [scannerPort, setScannerPort] = useState<number | ''>(
    () => port ?? updatePort(scannerType),
  );

  name = name || _('Unnamed');
  title = title || _('New Scanner');

  const scannerTypes: ScannerType[] = [OPENVAS_SCANNER_TYPE];

  if (
    scannerType === OPENVASD_SCANNER_TYPE ||
    features.featureEnabled('ENABLE_OPENVASD')
  ) {
    scannerTypes.push(OPENVASD_SCANNER_TYPE);
  }

  if (
    scannerType === AGENT_CONTROLLER_SCANNER_TYPE ||
    (features.featureEnabled('ENABLE_AGENTS') &&
      capabilities.mayAccess('agent'))
  ) {
    scannerTypes.push(AGENT_CONTROLLER_SCANNER_TYPE);
  }

  if (
    scannerType === AGENT_CONTROLLER_SENSOR_SCANNER_TYPE ||
    (features.featureEnabled('ENABLE_AGENTS') &&
      capabilities.mayAccess('agent') &&
      gmp.settings.enableGreenboneSensor)
  ) {
    scannerTypes.push(AGENT_CONTROLLER_SENSOR_SCANNER_TYPE);
  }

  if (
    scannerType === GREENBONE_SENSOR_SCANNER_TYPE ||
    gmp.settings.enableGreenboneSensor
  ) {
    scannerTypes.push(GREENBONE_SENSOR_SCANNER_TYPE);
  }

  if (
    scannerType === CONTAINER_IMAGE_SCANNER_TYPE ||
    features.featureEnabled('ENABLE_CONTAINER_SCANNING')
  ) {
    scannerTypes.push(CONTAINER_IMAGE_SCANNER_TYPE);
  }

  const handleCaCertificateChange = async (file?: File | null) => {
    if (file) {
      const content = await file.text();
      if (!content.includes(CA_CERTIFICATE_LINE)) {
        setError(_('Not a valid CA Certificate file.'));
        return;
      }
    }
    setCaCertificate(file ?? undefined);
  };

  const handleScannerTypeChange = (value: ScannerType) => {
    if (!userChangedPort) {
      setScannerPort(() => updatePort(value));
    }
    setScannerType(value);
  };

  const handleScannerPortChange = (value: number) => {
    // allow to update the port automatically if the field is empty
    setUserChangedPort(!isEmpty(value));
    setScannerPort(value);
  };

  const scannerTypesOptions = map(scannerTypes, scannerType => ({
    label: scannerTypeName(scannerType),
    value: scannerType,
  }));

  const isGreenboneSensorType = scannerType === GREENBONE_SENSOR_SCANNER_TYPE;
  const isAgentControllerSensorScannerType =
    scannerType === AGENT_CONTROLLER_SENSOR_SCANNER_TYPE;
  const showScannerDetails = isDefined(scannerType);
  const showCredentialField =
    !isGreenboneSensorType &&
    !isAgentControllerSensorScannerType &&
    showScannerDetails;
  const showCaCertificateField =
    !isGreenboneSensorType &&
    !isAgentControllerSensorScannerType &&
    showScannerDetails;
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
      error={error}
      title={title}
      values={{
        caCertificate,
        credentialId,
        type: scannerType,
        port: scannerPort,
      }}
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
              disabled={scannerInUse}
              items={scannerTypesOptions}
              label={_('Scanner Type')}
              name="type"
              placeholder={_('Select a Scanner Type')}
              value={state.type}
              onChange={handleScannerTypeChange as (value: string) => void}
            />

            {showScannerDetails && (
              <TextField
                disabled={scannerInUse}
                name="host"
                placeholder={_('Insert a Host name or IP address')}
                title={_('Host')}
                value={state.host}
                onChange={onValueChange}
              />
            )}

            {showScannerDetails && (
              <NumberField
                disabled={scannerInUse}
                name="port"
                placeholder={_('Insert a Port number')}
                title={_('Port')}
                value={state.port}
                onChange={handleScannerPortChange}
              />
            )}

            {showCaCertificateField && (
              <FileField
                name="caCertificate"
                placeholder={_('Upload CA Certificate')}
                title={_('CA Certificate')}
                value={state.caCertificate ?? null}
                onChange={handleCaCertificateChange}
              />
            )}

            {showCredentialField && (
              <FormGroup direction="row" title={_('Credential')}>
                <Select
                  allowDeselect
                  clearable
                  aria-label={_('Credential')}
                  grow="1"
                  items={renderSelectItems(
                    credentials as RenderSelectItemProps[],
                  )}
                  name="credentialId"
                  placeholder={_('Select a Credential')}
                  value={credentialId ?? ''}
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
