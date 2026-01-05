/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {type CredentialDownloadFormat} from 'gmp/commands/credential';
import {type EntityCommandParams} from 'gmp/commands/entity';
import {
  ALL_CREDENTIAL_TYPES,
  type SNMPAuthAlgorithmType,
  type default as Credential,
  type CredentialType,
  type SNMPPrivacyAlgorithmType,
  KRB5_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import useEntityClone, {
  type EntityCloneResponse,
} from 'web/entity/hooks/useEntityClone';
import useEntityCreate, {
  type EntityCreateResponse,
} from 'web/entity/hooks/useEntityCreate';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';
import useEntityDownload, {
  type OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import useEntitySave, {
  type EntitySaveResponse,
} from 'web/entity/hooks/useEntitySave';
import {isCredentialStoreType} from 'web/hooks/useCredentialStore';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import CredentialDialog, {
  type CredentialDialogState,
} from 'web/pages/credentials/CredentialDialog';

interface CredentialComponentRenderProps {
  clone: (credential: Credential) => Promise<void>;
  create: () => void;
  delete: (credential: Credential) => Promise<void>;
  edit: (credential: Credential) => void;
  download: (credential: Credential) => Promise<void>;
  downloadInstaller: (
    credential: Credential,
    format: CredentialDownloadFormat,
  ) => Promise<void>;
}

interface CredentialComponentProps {
  children: (props: CredentialComponentRenderProps) => React.ReactNode;
  onCloneError?: (error: Error) => void;
  onCloned?: (entity: EntityCloneResponse) => void;
  onCreateError?: (error: Error) => void;
  onCreated?: (entity: EntityCreateResponse) => void;
  onDeleteError?: (error: Error) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onInstallerDownloadError?: (error: Error) => void;
  onInstallerDownloaded?: OnDownloadedFunc<ArrayBuffer>;
  onSaveError?: (error: Error) => void;
  onSaved?: (entity: EntitySaveResponse) => void;
}

const createFakeFile = (name: string, id: string, extension: string) =>
  new File([], `${name}-${id}.${extension}`);

const CredentialComponent = ({
  children,
  onCloneError,
  onCloned,
  onCreateError,
  onCreated,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
  onInstallerDownloadError,
  onInstallerDownloaded,
  onSaveError,
  onSaved,
}: CredentialComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);

  const [comment, setComment] = useState<string | undefined>();
  const [certificate, setCertificate] = useState<File | undefined>();
  const [credential, setCredential] = useState<Credential | undefined>();
  const [credentialType, setCredentialType] = useState<
    CredentialType | undefined
  >();
  const [authAlgorithm, setAuthAlgorithm] = useState<
    SNMPAuthAlgorithmType | undefined
  >();
  const [name, setName] = useState<string | undefined>();
  const [credentialLogin, setCredentialLogin] = useState<string | undefined>();
  const [privacyAlgorithm, setPrivacyAlgorithm] = useState<
    SNMPPrivacyAlgorithmType | undefined
  >();
  const [privacyHostIdentifier, setPrivacyHostIdentifier] = useState<
    string | undefined
  >();
  const [privateKey, setPrivateKey] = useState<File | undefined>();
  const [publicKey, setPublicKey] = useState<File | undefined>();
  const [vaultId, setVaultId] = useState<string | undefined>();
  const [hostIdentifier, setHostIdentifier] = useState<string | undefined>();
  const [types, setTypes] =
    useState<readonly CredentialType[]>(ALL_CREDENTIAL_TYPES);
  const [title, setTitle] = useState<string>('');

  const openCredentialsDialog = async (cred?: Credential) => {
    if (isDefined(cred)) {
      const response = await gmp.credential.get({id: cred.id as string});
      const credential = response.data;
      const dialogTitle = _('Edit Credential {{name}}', {
        name: shorten(credential.name),
      });
      setCertificate(
        isDefined(credential.certificateInfo)
          ? createFakeFile('certificate', credential.id as string, 'pem')
          : undefined,
      );
      setPrivateKey(
        isDefined(credential.privateKeyInfo)
          ? createFakeFile('private-key', credential.id as string, 'key')
          : undefined,
      );
      setPublicKey(
        isDefined(credential.publicKeyInfo)
          ? createFakeFile('public-key', credential.id as string, 'key')
          : undefined,
      );
      setComment(credential.comment);
      setCredential(credential);
      setCredentialType(credential.credentialType);
      setAuthAlgorithm(credential.authAlgorithm);
      setName(credential.name);
      setCredentialLogin(credential.login);
      setPrivacyAlgorithm(credential.privacyAlgorithm);
      setPrivacyHostIdentifier(credential.privacyHostIdentifier);
      setVaultId(credential.credentialStore?.vaultId);
      setHostIdentifier(credential.credentialStore?.hostIdentifier);
      setTypes([credential.credentialType as CredentialType]);
      setTitle(dialogTitle);
    } else {
      // reset all values in state to not show values from last edit
      setAuthAlgorithm(undefined);
      setCertificate(undefined);
      setComment(undefined);
      setCredential(undefined);
      setCredentialLogin(undefined);
      setCredentialType(undefined);
      setHostIdentifier(undefined);
      setName(undefined);
      setPrivacyAlgorithm(undefined);
      setPrivacyHostIdentifier(undefined);
      setPrivateKey(undefined);
      setPublicKey(undefined);
      setTitle(_('New Credential'));
      setTypes(ALL_CREDENTIAL_TYPES);
      setVaultId(undefined);
    }

    setDialogVisible(true);
  };

  const closeCredentialDialog = () => {
    setDialogVisible(false);
  };

  const handleEntityDownloadInstaller = useEntityDownload<
    Credential,
    ArrayBuffer,
    {format: CredentialDownloadFormat}
  >(
    (cred, options) =>
      gmp.credential.download({id: cred.id as string}, options?.format),
    {
      onDownloadError: onInstallerDownloadError,
      onDownloaded: onInstallerDownloaded,
    },
  );

  const handleDownloadInstaller = (
    cred: Credential,
    format: CredentialDownloadFormat,
  ) => {
    return handleEntityDownloadInstaller(cred, {format, extension: format});
  };

  const handleEntitySave = useEntitySave(
    (data: CredentialDialogState) => {
      if (isCredentialStoreType(data.credentialType)) {
        return gmp.credential.saveCredentialStore({
          id: data.id as string,
          ...data,
        });
      }
      if (data.credentialType === KRB5_CREDENTIAL_TYPE) {
        return gmp.credential.saveKrb5({id: data.id as string, ...data});
      }
      // Regular credentials use the clean base save method
      return gmp.credential.save({id: data.id as string, ...data});
    },
    {onSaveError, onSaved},
  );

  const handleEntityCreate = useEntityCreate(
    (data: CredentialDialogState) => {
      if (isCredentialStoreType(data.credentialType)) {
        return gmp.credential.createCredentialStore(data);
      }
      if (data.credentialType === KRB5_CREDENTIAL_TYPE) {
        return gmp.credential.createKrb5(data);
      }
      // Regular credentials use the clean base create method
      return gmp.credential.create(data);
    },
    {onCreateError, onCreated},
  );

  const handleEntityClone = useEntityClone(
    (data: EntityCommandParams) => gmp.credential.clone(data),
    {
      onCloneError,
      onCloned,
    },
  );

  const handleEntityDelete = useEntityDelete<Credential>(
    data => gmp.credential.delete(data),
    {onDeleteError, onDeleted},
  );

  const handleEntityDownload = useEntityDownload<Credential, string>(
    data => gmp.credential.export({id: data.id as string}),
    {onDownloadError, onDownloaded},
  );

  const handleSave = async (data: CredentialDialogState) => {
    const promise = isDefined(data.id)
      ? handleEntitySave(data)
      : handleEntityCreate(data);
    await promise;
    return closeCredentialDialog();
  };
  return (
    <>
      {children({
        clone: handleEntityClone,
        delete: handleEntityDelete,
        create: () => openCredentialsDialog(),
        edit: openCredentialsDialog,
        download: handleEntityDownload,
        downloadInstaller: handleDownloadInstaller,
      })}
      {dialogVisible && (
        <CredentialDialog
          authAlgorithm={authAlgorithm}
          certificate={certificate}
          comment={comment}
          credential={credential}
          credentialLogin={credentialLogin}
          credentialType={credentialType}
          hostIdentifier={hostIdentifier}
          name={name}
          privacyAlgorithm={privacyAlgorithm}
          privacyHostIdentifier={privacyHostIdentifier}
          privateKey={privateKey}
          publicKey={publicKey}
          title={title}
          types={types}
          vaultId={vaultId}
          onClose={closeCredentialDialog}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default CredentialComponent;
