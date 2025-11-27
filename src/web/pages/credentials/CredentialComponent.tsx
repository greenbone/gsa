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
  const [types, setTypes] =
    useState<readonly CredentialType[]>(ALL_CREDENTIAL_TYPES);
  const [title, setTitle] = useState<string>('');

  const openCredentialsDialog = (credential?: Credential) => {
    if (isDefined(credential)) {
      const dialogTitle = _('Edit Credential {{name}}', {
        name: shorten(credential.name),
      });

      setComment(credential.comment);
      setCredential(credential);
      setCredentialType(credential.credentialType);
      setAuthAlgorithm(credential.authAlgorithm);
      setName(credential.name);
      setCredentialLogin(credential.login);
      setPrivacyAlgorithm(credential.privacyAlgorithm);
      setTypes([credential.credentialType as CredentialType]);
      setTitle(dialogTitle);
    } else {
      // reset all values in state to not show values from last edit
      setComment(undefined);
      setCredential(undefined);
      setCredentialType(undefined);
      setAuthAlgorithm(undefined);
      setName(undefined);
      setCredentialLogin(undefined);
      setPrivacyAlgorithm(undefined);
      setTypes(ALL_CREDENTIAL_TYPES);
      setTitle(_('New Credential'));
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
    (data: CredentialDialogState) =>
      gmp.credential.save({
        ...data,
        id: data.id as string,
      }),
    {onSaveError, onSaved},
  );

  const handleEntityCreate = useEntityCreate(
    (data: CredentialDialogState) => gmp.credential.create(data),
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
          comment={comment}
          credential={credential}
          credentialLogin={credentialLogin}
          credentialType={credentialType}
          name={name}
          privacyAlgorithm={privacyAlgorithm}
          title={title}
          types={types}
          onClose={closeCredentialDialog}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default CredentialComponent;
