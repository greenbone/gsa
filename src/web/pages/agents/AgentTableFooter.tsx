/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {showInfoNotification} from '@greenbone/ui-lib';
import type CollectionCounts from 'gmp/collection/collection-counts';
import type Agent from 'gmp/models/agent';
import type Filter from 'gmp/models/filter';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/DialogTwoButtonFooter';
import AuthorizeIcon from 'web/components/icon/AuthorizeIcon';
import DisableUpdateToLatestIcon from 'web/components/icon/DisableUpdateToLatestIcon';
import EnableUpdateToLatestIcon from 'web/components/icon/EnableUpdateToLatestIcon';
import RevokeIcon from 'web/components/icon/RevokeIcon';
import EntitiesFooter from 'web/entities/EntitiesFooter';
import useTranslation from 'web/hooks/useTranslation';
import type {SelectionTypeType} from 'web/utils/SelectionType';

type AgentBulkAction =
  | 'authorize'
  | 'revoke'
  | 'enableUpdateToLatest'
  | 'disableUpdateToLatest';

interface DialogConfig {
  title: string;
  content: string;
  buttonTitle: string;
  infoText: string;
  handler?: () => void | Promise<void>;
}

export interface AgentTableFooterProps {
  entities?: Agent[];
  entitiesCounts?: CollectionCounts;
  filter?: Filter;
  selectionType?: SelectionTypeType;
  onSelectionTypeChange?: (selectionType: SelectionTypeType) => void;

  onDeleteBulk?: () => void | Promise<void>;
  onTagsBulk?: () => void;

  onAuthorizeBulk?: () => void | Promise<void>;
  onRevokeBulk?: () => void | Promise<void>;
  onEnableUpdateToLatestBulk?: () => void | Promise<void>;
  onDisableUpdateToLatestBulk?: () => void | Promise<void>;
}

const AgentTableFooter = ({
  selectionType,
  onSelectionTypeChange,
  onDeleteBulk,
  onTagsBulk,
  onAuthorizeBulk,
  onRevokeBulk,
  onEnableUpdateToLatestBulk,
  onDisableUpdateToLatestBulk,
}: AgentTableFooterProps) => {
  const [_] = useTranslation();
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | undefined>();
  const [isInProgress, setIsInProgress] = useState(false);

  const openDialog = (
    action: AgentBulkAction,
    handler?: () => void | Promise<void>,
  ) => {
    const configs: Record<AgentBulkAction, DialogConfig> = {
      authorize: {
        title: _('Confirm authorization'),
        content: _('Are you sure you want to authorize all selected agents?'),
        buttonTitle: _('Authorize'),
        infoText: _('Authorizing agents'),
        handler,
      },
      revoke: {
        title: _('Confirm revocation'),
        content: _('Are you sure you want to revoke all selected agents?'),
        buttonTitle: _('Revoke'),
        infoText: _('Revoking agents'),
        handler,
      },
      enableUpdateToLatest: {
        title: _('Confirm enable automatic update to latest'),
        content: _(
          'Are you sure you want to enable automatic update to latest for all selected agents?',
        ),
        buttonTitle: _('Enable automatic Update to Latest'),
        infoText: _('Enabling automatic update to latest'),
        handler,
      },
      disableUpdateToLatest: {
        title: _('Confirm disable automatic update to latest'),
        content: _(
          'Are you sure you want to disable automatic update to latest for all selected agents?',
        ),
        buttonTitle: _('Disable automatic Update to Latest'),
        infoText: _('Disabling automatic update to latest'),
        handler,
      },
    };

    setDialogConfig(configs[action]);
  };

  const closeDialog = () => {
    setDialogConfig(undefined);
  };

  const confirmAction = async () => {
    if (!dialogConfig?.handler) {
      closeDialog();
      return;
    }

    try {
      setIsInProgress(true);
      showInfoNotification('', dialogConfig.infoText);
      await dialogConfig.handler();
    } finally {
      setIsInProgress(false);
      closeDialog();
    }
  };

  return (
    <>
      <EntitiesFooter<Agent>
        data-testid="agents-footer"
        delete={true}
        selectionType={selectionType}
        span={8}
        tags={true}
        onDeleteClick={onDeleteBulk}
        onSelectionTypeChange={onSelectionTypeChange}
        onTagsClick={onTagsBulk}
      >
        <AuthorizeIcon
          loading={isInProgress}
          selectionType={selectionType}
          onClick={() => openDialog('authorize', onAuthorizeBulk)}
        />
        <RevokeIcon
          loading={isInProgress}
          selectionType={selectionType}
          onClick={() => openDialog('revoke', onRevokeBulk)}
        />
        <EnableUpdateToLatestIcon
          loading={isInProgress}
          selectionType={selectionType}
          onClick={() =>
            openDialog('enableUpdateToLatest', onEnableUpdateToLatestBulk)
          }
        />
        <DisableUpdateToLatestIcon
          loading={isInProgress}
          selectionType={selectionType}
          onClick={() =>
            openDialog('disableUpdateToLatest', onDisableUpdateToLatestBulk)
          }
        />
      </EntitiesFooter>

      {dialogConfig && (
        <ConfirmationDialog
          content={dialogConfig.content}
          loading={isInProgress}
          rightButtonAction={DELETE_ACTION}
          rightButtonTitle={dialogConfig.buttonTitle}
          title={dialogConfig.title}
          width="500px"
          onClose={closeDialog}
          onResumeClick={() => {
            void confirmAction();
          }}
        />
      )}
    </>
  );
};

export default AgentTableFooter;
