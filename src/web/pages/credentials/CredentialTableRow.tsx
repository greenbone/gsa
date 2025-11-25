/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  type default as Credential,
  type CredentialType,
  getCredentialTypeName,
} from 'gmp/models/credential';
import FootNote from 'web/components/footnote/Footnote';
import Divider from 'web/components/layout/Divider';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import useTranslation from 'web/hooks/useTranslation';
import CredentialActions, {
  type CredentialActionsProps,
} from 'web/pages/credentials/CredentialActions';

export interface CredentialTableRowProps extends CredentialActionsProps {
  actionsComponent?: React.ComponentType<CredentialActionsProps>;
  entity: Credential;
  links?: boolean;
  onToggleDetailsClick?: () => void;
}

const CredentialTableRow = ({
  actionsComponent: ActionsComponent = CredentialActions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}: CredentialTableRowProps) => {
  const [_] = useTranslation();
  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Credential')}
        entity={entity}
        links={links}
        type="credential"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        <Divider>
          <span>
            {getCredentialTypeName(entity.credentialType as CredentialType)}
          </span>
          <FootNote>({entity.credentialType})</FootNote>
        </Divider>
      </TableData>
      <TableData>{entity.login}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default CredentialTableRow;
