/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type default as Credential,
  type CredentialType,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import MultiValueTextField from 'web/components/form/MultiValueTextField';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {NewIcon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {type RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

interface NewCredential {
  title: string;
  types: CredentialType[];
}

interface WebApplicationTargetsDialogValues {
  credentialId: string;
}

interface WebApplicationTargetsDialogDefaultValues {
  comment: string;
  inUse: boolean;
  name: string;
  reverseLookupOnly: boolean;
  reverseLookupUnify: boolean;
  urls: string[];
  excludeUrls: string[];
}

export type WebApplicationTargetsDialogData =
  WebApplicationTargetsDialogValues & WebApplicationTargetsDialogDefaultValues;

interface WebApplicationTargetsDialogProps {
  comment?: string;
  credentials?: Credential[];
  inUse?: boolean;
  name?: string;
  reverseLookupOnly?: boolean;
  reverseLookupUnify?: boolean;
  credentialId?: string;
  urls?: string[];
  excludeUrls?: string[];
  title?: string;
  onClose?: () => void;
  onNewCredentialsClick?: (newCredential: NewCredential) => void;
  onCredentialChange?: (credentialId: string) => void;
  onSave?: (data: WebApplicationTargetsDialogData) => void | Promise<void>;
}

const WebApplicationTargetsDialog = ({
  comment = '',
  credentials = [],
  inUse = false,
  name,
  reverseLookupOnly = false,
  reverseLookupUnify = false,
  credentialId,
  urls = [] as string[],
  excludeUrls = [] as string[],
  title,
  onClose,
  onNewCredentialsClick,
  onSave,
  onCredentialChange,
}: WebApplicationTargetsDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const hasPermissionToCreateCredential = capabilities.mayCreate('credential');

  name = name || _('Unnamed');
  title = title || _('New Web Application Target');

  const NEW_CREDENTIAL = {
    title: _('Create new credential'),
    types: [USERNAME_PASSWORD_CREDENTIAL_TYPE] as CredentialType[],
  };

  const upCredentials = credentials.filter(
    value => value.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );

  const uncontrolledValues = {
    comment,
    name,
    inUse,
    reverseLookupOnly,
    reverseLookupUnify,
    urls,
    excludeUrls,
  };

  const controlledValues = {
    credentialId: credentialId ?? '',
  };

  return (
    <SaveDialog<
      WebApplicationTargetsDialogValues,
      WebApplicationTargetsDialogDefaultValues
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

            <FormGroup title={_('URLs')}>
              <MultiValueTextField
                disabled={inUse}
                name="urls"
                placeholder={_('Enter a URL and press Enter')}
                value={state.urls}
                onChange={value => onValueChange(value, 'urls')}
              />
            </FormGroup>

            <FormGroup title={_('Exclude URLs')}>
              <MultiValueTextField
                disabled={inUse}
                name="excludeUrls"
                placeholder={_('Enter a URL and press Enter')}
                value={state.excludeUrls}
                onChange={value => onValueChange(value, 'excludeUrls')}
              />
            </FormGroup>

            {capabilities.mayAccess('credential') && (
              <h4>{_('Credential for authenticated checks')}</h4>
            )}

            {capabilities.mayAccess('credential') && (
              <FormGroup direction="row" title={_('Credential')}>
                <Select
                  data-testid="credential-select"
                  disabled={inUse}
                  grow="1"
                  items={renderSelectItems(
                    upCredentials as RenderSelectItemProps[],
                  )}
                  name="credentialId"
                  value={state.credentialId}
                  onChange={onCredentialChange}
                />
                {!inUse && hasPermissionToCreateCredential && (
                  <NewIcon<NewCredential>
                    data-testid="new-icon-credential"
                    title={_('Create a new credential')}
                    value={NEW_CREDENTIAL}
                    onClick={onNewCredentialsClick}
                  />
                )}
              </FormGroup>
            )}

            <FormGroup title={_('Reverse Lookup Only')}>
              <YesNoRadio
                convert={val => val === 'true'}
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
                convert={val => val === 'true'}
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

export default WebApplicationTargetsDialog;
