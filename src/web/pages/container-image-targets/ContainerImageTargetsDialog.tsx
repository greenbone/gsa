/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type default as Credential,
  type ALL_CREDENTIAL_TYPES,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import type Filter from 'gmp/models/filter';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {NewIcon} from 'web/components/icon';
import Row from 'web/components/layout/Row';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

type TargetSource = 'manual' | 'file' | 'asset_hosts';
type TargetExcludeSource = 'manual' | 'file';
type CredentialType = (typeof ALL_CREDENTIAL_TYPES)[number];

interface NewCredential {
  idField: string;
  title: string;
  types: CredentialType[];
}

interface ContainerImageTargetsDialogValues {
  smbCredentialId: string;
}

interface ContainerImageTargetsDialogDefaultValues {
  comment: string;
  excludeHosts: string;
  hosts: string;
  hostsCount?: number;
  hostsFilter?: Filter;
  inUse: boolean;
  name: string;
  reverseLookupOnly: boolean;
  reverseLookupUnify: boolean;
  targetExcludeSource: TargetExcludeSource;
  targetSource: TargetSource;
}

export type ContainerImageTargetsDialogData =
  ContainerImageTargetsDialogValues & ContainerImageTargetsDialogDefaultValues;

interface ContainerImageTargetsDialogProps {
  comment?: string;
  credentials?: Credential[];
  excludeHosts?: string;
  hosts?: string;
  hostsCount?: number;
  hostsFilter?: Filter;
  inUse?: boolean;
  name?: string;
  reverseLookupOnly?: boolean;
  reverseLookupUnify?: boolean;
  smbCredentialId?: string;
  targetSource?: TargetSource;
  targetExcludeSource?: TargetExcludeSource;
  title?: string;
  onClose?: () => void;
  onNewCredentialsClick?: (newCredential: NewCredential) => void;
  onSmbCredentialChange?: (smbCredentialId: string) => void;
  onSave?: (data: ContainerImageTargetsDialogData) => void | Promise<void>;
}

const ContainerImageTargetsDialog = ({
  comment = '',
  credentials = [],
  excludeHosts = '',
  hosts = '',
  hostsCount,
  hostsFilter,
  inUse = false,
  name,
  reverseLookupOnly = false,
  reverseLookupUnify = false,
  smbCredentialId = UNSET_VALUE,
  targetSource = 'manual',
  targetExcludeSource = 'manual',
  title,
  onClose,
  onNewCredentialsClick,
  onSave,
  onSmbCredentialChange,
  ...initial
}: ContainerImageTargetsDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const hasPermissionToCreateCredential = capabilities.mayCreate('credential');

  name = name || _('Unnamed');
  title = title || _('New Container Image Target');

  const NEW_SMB = {
    idField: 'smbCredentialId',
    title: _('Create new credential'),
    types: [USERNAME_PASSWORD_CREDENTIAL_TYPE] as CredentialType[],
  };

  // filter for username+password credentials only
  const upCredentials = credentials.filter(
    value => value.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );

  const uncontrolledValues = {
    ...initial,
    comment,
    name,
    excludeHosts,
    hosts,
    hostsCount,
    hostsFilter,
    inUse,
    reverseLookupOnly,
    reverseLookupUnify,
    targetSource,
    targetExcludeSource,
  };

  const controlledValues = {
    smbCredentialId,
  };

  return (
    <SaveDialog<
      ContainerImageTargetsDialogValues,
      ContainerImageTargetsDialogDefaultValues
    >
      defaultValues={uncontrolledValues}
      title={title}
      values={controlledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
                grow="1"
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

            <FormGroup title={_('Hosts')}>
              <Row>
                <Radio
                  checked={state.targetSource === 'manual'}
                  disabled={inUse}
                  name="targetSource"
                  title={_('Manual')}
                  value="manual"
                  onChange={onValueChange}
                />
                <TextField
                  disabled={inUse || state.targetSource !== 'manual'}
                  grow="1"
                  name="hosts"
                  value={state.hosts}
                  onChange={onValueChange}
                />
              </Row>
              <Row>
                <Radio
                  checked={state.targetSource === 'file'}
                  disabled={inUse}
                  name="targetSource"
                  title={_('From file')}
                  value="file"
                  onChange={onValueChange}
                />
                <FileField
                  disabled={inUse || state.targetSource !== 'file'}
                  grow="1"
                  name="file"
                  onChange={
                    onValueChange as (value?: File, name?: string) => void
                  }
                />

                {state.hostsCount && (
                  <Radio
                    checked={state.targetSource === 'asset_hosts'}
                    disabled={inUse}
                    name="targetSource"
                    title={_('From host assets ({{count}} hosts)', {
                      count: state.hostsCount,
                    })}
                    value="asset_hosts"
                    onChange={onValueChange}
                  />
                )}
              </Row>
            </FormGroup>

            <FormGroup title={_('Exclude Hosts')}>
              <Row>
                <Radio
                  checked={state.targetExcludeSource === 'manual'}
                  disabled={inUse}
                  name="targetExcludeSource"
                  title={_('Manual')}
                  value="manual"
                  onChange={onValueChange}
                />
                <TextField
                  disabled={inUse || state.targetExcludeSource !== 'manual'}
                  grow="1"
                  name="excludeHosts"
                  value={state.excludeHosts}
                  onChange={onValueChange}
                />
              </Row>
              <Row>
                <Radio
                  checked={state.targetExcludeSource === 'file'}
                  disabled={inUse}
                  name="targetExcludeSource"
                  title={_('From file')}
                  value="file"
                  onChange={onValueChange}
                />
                <FileField
                  disabled={inUse || state.targetExcludeSource !== 'file'}
                  grow="1"
                  name="excludeFile"
                  onChange={
                    onValueChange as (value?: File, name?: string) => void
                  }
                />
              </Row>
            </FormGroup>

            {capabilities.mayAccess('credential') && (
              <h4>{_('Credential for authenticated checks')}</h4>
            )}

            {capabilities.mayAccess('credential') && (
              <FormGroup direction="row" title={_('Credential')}>
                <Select
                  data-testid="smb-credential-select"
                  disabled={inUse}
                  grow="1"
                  items={renderSelectItems(
                    upCredentials as RenderSelectItemProps[],
                    UNSET_VALUE,
                  )}
                  name="smbCredentialId"
                  value={state.smbCredentialId}
                  onChange={onSmbCredentialChange}
                />
                {!inUse && hasPermissionToCreateCredential && (
                  <NewIcon<NewCredential>
                    data-testid="new-icon-smb"
                    title={_('Create a new credential')}
                    value={NEW_SMB}
                    onClick={
                      onNewCredentialsClick as (value?: NewCredential) => void
                    }
                  />
                )}
              </FormGroup>
            )}

            <FormGroup title={_('Reverse Lookup Only')}>
              <YesNoRadio
                convert={val => (val === 'true' ? true : false)}
                disabled={inUse}
                name="reverseLookupOnly"
                noValue={false}
                value={state.reverseLookupOnly}
                yesValue={true}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Reverse Lookup Unify')}>
              <YesNoRadio
                convert={val => (val === 'true' ? true : false)}
                disabled={inUse}
                name="reverseLookupUnify"
                noValue={false}
                value={state.reverseLookupUnify}
                yesValue={true}
                onChange={onValueChange}
              />
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

export default ContainerImageTargetsDialog;
