/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {type EntityActionData} from 'gmp/commands/entity';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fastxml';
import type ActionResult from 'gmp/models/actionresult';
import {
  type default as Credential,
  type CredentialType,
  CERTIFICATE_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {
  type default as Scanner,
  type ScannerType,
  AGENT_CONTROLLER_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {hasId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import useEntityClone from 'web/entity/hooks/useEntityClone';
import useEntityCreate from 'web/entity/hooks/useEntityCreate';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';
import useEntityDownload, {
  type OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import useEntitySave from 'web/entity/hooks/useEntitySave';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import CredentialDialog, {
  type CredentialDialogState,
} from 'web/pages/credentials/CredentialDialog';
import ScannerDialog, {
  type ScannerDialogState,
} from 'web/pages/scanners/ScannerDialog';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import {generateFilename} from 'web/utils/Render';

interface ScannerComponentRenderProps {
  clone: (scanner: Scanner) => Promise<void>;
  create: () => Promise<void>;
  delete: (scanner: Scanner) => Promise<void>;
  download: (scanner: Scanner) => Promise<void>;
  downloadCertificate: (scanner: Scanner) => void;
  downloadCredential: (scanner: Scanner) => Promise<void>;
  edit: (scanner: Scanner) => Promise<void>;
  verify: (scanner: Scanner) => Promise<void>;
}

interface ScannerComponentProps {
  children: (props: ScannerComponentRenderProps) => React.ReactNode;
  onCertificateDownloaded?: OnDownloadedFunc;
  onCloneError?: (error: Error) => void;
  onCloned?: (response: Response<EntityActionData, XmlMeta>) => void;
  onCreateError?: (error: Error) => void;
  onCreated?: (response: Response<ActionResult, XmlMeta>) => void;
  onCredentialDownloadError?: (error: Error) => void;
  onCredentialDownloaded?: OnDownloadedFunc;
  onDeleteError?: (error: Error) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onSaveError?: (error: Error) => void;
  onSaved?: () => void;
  onVerified?: () => void;
  onVerifyError?: (error: Error) => void;
}

const createCredentialsFilter = (types: CredentialType[]) => {
  return new Filter({
    terms: types.map(
      credentialType =>
        new FilterTerm({
          keyword: 'type',
          value: credentialType,
          relation: '=',
        }),
    ),
  });
};

const ScannerComponent = ({
  children,
  onCertificateDownloaded,
  onCloneError,
  onCloned,
  onCreateError,
  onCreated,
  onCredentialDownloadError,
  onCredentialDownloaded,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
  onSaveError,
  onSaved,
  onVerified,
  onVerifyError,
}: ScannerComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);
  const username = useShallowEqualSelector(getUsername);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  const [credentialDialogVisible, setCredentialDialogVisible] = useState(false);
  const [scannerDialogVisible, setScannerDialogVisible] = useState(false);
  const [comment, setComment] = useState(undefined);
  const [credentialId, setCredentialId] = useState<string | undefined>(
    undefined,
  );
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([
    CERTIFICATE_CREDENTIAL_TYPE,
  ]);
  const [host, setHost] = useState<string | undefined>(undefined);
  const [id, setId] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);
  const [port, setPort] = useState<number | undefined>(undefined);
  const [scanner, setScanner] = useState<Scanner | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [type, setType] = useState<ScannerType | undefined>(undefined);

  const openScannerDialog = async (scanner?: Scanner) => {
    if (isDefined(scanner)) {
      const credentialTypes: CredentialType[] =
        scanner.scannerType === OPENVASD_SCANNER_TYPE ||
        scanner.scannerType === AGENT_CONTROLLER_SCANNER_TYPE
          ? [CERTIFICATE_CREDENTIAL_TYPE]
          : [];
      const credentialsPromise =
        credentialTypes.length > 0
          ? // @ts-expect-error
            gmp.credentials
              .getAll({
                filter: createCredentialsFilter(credentialTypes),
              })
              .then(response => response.data)
          : Promise.resolve([]);

      const [credentials, loadedScanner] = await Promise.all([
        credentialsPromise,
        gmp.scanner
          .get({id: scanner.id as string})
          .then(response => response.data),
      ]);
      const scannerTitle = _('Edit Scanner {{name}}', {
        name: shorten(loadedScanner.name),
      });

      setComment(loadedScanner.comment);
      setCredentials(credentials);
      setCredentialId(
        hasId(loadedScanner.credential)
          ? loadedScanner.credential.id
          : undefined,
      );
      setCredentialTypes(credentialTypes);
      setHost(loadedScanner.host);
      setId(loadedScanner.id);
      setName(loadedScanner.name);
      setPort(loadedScanner.port);
      setScannerDialogVisible(true);
      setScanner(loadedScanner);
      setTitle(scannerTitle);
      setType(loadedScanner.scannerType);
    } else {
      const credentialTypes: CredentialType[] = [CERTIFICATE_CREDENTIAL_TYPE];
      // @ts-expect-error
      const credentials = await gmp.credentials
        .getAll({
          filter: createCredentialsFilter(credentialTypes),
        })
        .then(response => response.data);
      setComment(undefined);
      setCredentialId(undefined);
      setCredentials(credentials);
      setCredentialTypes(credentialTypes);
      setHost(undefined);
      setId(undefined);
      setName(undefined);
      setPort(undefined);
      setScanner(undefined);
      setScannerDialogVisible(true);
      setTitle(undefined);
      setType(undefined);
    }
  };

  const closeScannerDialog = () => {
    setScannerDialogVisible(false);
  };

  const handleCloseScannerDialog = () => {
    closeScannerDialog();
  };

  const openCredentialsDialog = () => {
    setCredentialDialogVisible(true);
  };

  const closeCredentialsDialog = () => {
    setCredentialDialogVisible(false);
  };

  const handleCloseCredentialsDialog = () => {
    closeCredentialsDialog();
  };

  const handleVerifyFailure = response => {
    const message =
      response?.root?.action_result?.message ?? _('Unknown Error');

    onVerifyError?.(new Error(message));
  };

  const handleVerifyScanner = async (scanner: Scanner) => {
    try {
      await gmp.scanner.verify({id: scanner.id as string});
      onVerified?.();
    } catch (error) {
      handleVerifyFailure(error);
      return;
    }
  };

  const handleCreateCredential = async (data: CredentialDialogState) => {
    // @ts-expect-error
    const credential = await gmp.credential
      .create(data)
      .then(response => response.data);

    setCredentialId(credential.id);

    // @ts-expect-error
    const credentials = await gmp.credentials
      .getAll({
        filter: createCredentialsFilter(credentialTypes),
      })
      .then(response => response.data);
    setCredentials(credentials);
    closeCredentialsDialog();
  };

  const handleCredentialChange = (credId: string | undefined) => {
    setCredentialId(credId);
  };

  const handleDownloadCertificate = (scanner: Scanner) => {
    const {creationTime, entityType, id, modificationTime, name, caPub} =
      scanner;
    const filename = generateFilename({
      creationTime: creationTime,
      extension: 'pem',
      fileNameFormat: detailsExportFileName,
      id: id,
      modificationTime,
      resourceName: name,
      resourceType: entityType,
      username,
    });
    onCertificateDownloaded?.({
      filename,
      data: caPub?.certificate as string,
    });
  };

  const handleDownloadCredential = (scanner: Scanner) => {
    const credential = scanner.credential as Credential;
    const {creationTime, entityType, id, modificationTime, name} = credential;

    // @ts-expect-error
    return gmp.credential
      .download(credential, 'pem')
      .then(response => {
        const filename = generateFilename({
          creationTime,
          extension: 'pem',
          fileNameFormat: detailsExportFileName,
          id: id,
          modificationTime,
          resourceName: name,
          resourceType: entityType,
          username,
        });
        return {filename, data: response.data};
      })
      .then(onCredentialDownloaded, onCredentialDownloadError);
  };

  const handleScannerDownload = useEntityDownload<Scanner>('scanner', {
    onDownloadError,
    onDownloaded,
  });
  const handleScannerSave = useEntitySave<
    ScannerDialogState,
    Response<ActionResult, XmlMeta>,
    Error
  >('scanner', {
    onSaveError,
    onSaved,
  });
  const handleScannerCreate = useEntityCreate<
    ScannerDialogState,
    Response<ActionResult, XmlMeta>,
    Error
  >('scanner', {
    onCreated,
    onCreateError,
  });
  const handleScannerDelete = useEntityDelete<Scanner>('scanner', {
    onDeleteError,
    onDeleted,
  });
  const handleEntityClone = useEntityClone<Scanner>('scanner', {
    onCloneError,
    onCloned,
  });
  return (
    <>
      {children({
        clone: handleEntityClone as (scanner: Scanner) => Promise<void>,
        create: openScannerDialog,
        delete: handleScannerDelete,
        download: handleScannerDownload,
        downloadCertificate: handleDownloadCertificate,
        downloadCredential: handleDownloadCredential,
        edit: openScannerDialog,
        verify: handleVerifyScanner as (scanner: Scanner) => Promise<void>,
      })}
      {scannerDialogVisible && (
        <ScannerDialog
          comment={comment}
          credentialId={credentialId}
          credentials={credentials}
          host={host}
          id={id}
          name={name}
          port={port}
          scannerInUse={scanner?.isInUse() ?? false}
          title={title}
          type={type}
          onClose={handleCloseScannerDialog}
          onCredentialChange={handleCredentialChange}
          onNewCredentialClick={openCredentialsDialog}
          onSave={async d => {
            const promise = isDefined(d.id)
              ? handleScannerSave(d)
              : handleScannerCreate(d);
            await promise;
            return closeScannerDialog();
          }}
        />
      )}
      {credentialDialogVisible && (
        <CredentialDialog
          types={credentialTypes}
          onClose={handleCloseCredentialsDialog}
          onSave={handleCreateCredential}
        />
      )}
    </>
  );
};

export default ScannerComponent;
