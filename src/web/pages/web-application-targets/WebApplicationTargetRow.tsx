/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Model from 'gmp/models/model';
import type WebApplicationTarget from 'gmp/models/web-application-target';
import {isDefined} from 'gmp/utils/identity';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import {type RowComponentProps} from 'web/entities/EntitiesTable';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

interface CredProps {
  cred: Model | undefined;
  title: string;
  links?: boolean;
}

export interface WebApplicationTargetActionsProps extends Omit<
  EntitiesActionsProps<WebApplicationTarget>,
  'children'
> {
  onWebApplicationTargetEditClick?: (target: WebApplicationTarget) => void;
  onWebApplicationTargetCloneClick?: (target: WebApplicationTarget) => void;
  onWebApplicationTargetDownloadClick?: (target: WebApplicationTarget) => void;
  onWebApplicationTargetDeleteClick?: (target: WebApplicationTarget) => void;
}

export interface WebApplicationTargetTableRowProps
  extends
    WebApplicationTargetActionsProps,
    RowComponentProps<WebApplicationTarget> {
  actionsComponent?: React.ComponentType<WebApplicationTargetActionsProps>;
  links?: boolean;
  'data-testid'?: string;
}

const Actions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onWebApplicationTargetEditClick,
  onWebApplicationTargetCloneClick,
  onWebApplicationTargetDownloadClick,
  onWebApplicationTargetDeleteClick,
}: WebApplicationTargetActionsProps) => {
  const [_] = useTranslation();

  return (
    <EntitiesActions
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon
          displayName={_('Web Application Target')}
          entity={entity}
          name="webapplicationtarget"
          onClick={onWebApplicationTargetDeleteClick}
        />
        <EditIcon
          displayName={_('Web Application Target')}
          entity={entity}
          name="webapplicationtarget"
          onClick={onWebApplicationTargetEditClick}
        />
        <CloneIcon
          displayName={_('Web Application Target')}
          entity={entity}
          name="webapplicationtarget"
          title={_('Clone Web Application Target')}
          onClick={onWebApplicationTargetCloneClick}
        />
        <ExportIcon
          title={_('Export Web Application Target')}
          value={entity}
          onClick={onWebApplicationTargetDownloadClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

const Cred = ({cred, title, links = true}: CredProps) => {
  if (!isDefined(cred) || !isDefined(cred.id)) {
    return null;
  }
  return (
    <Layout>
      <span>{title}: </span>
      <Layout>
        <DetailsLink id={cred.id} textOnly={!links} type="credential">
          {cred.name}
        </DetailsLink>
      </Layout>
    </Layout>
  );
};

const WebApplicationTargetRow = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  'data-testid': dataTestId,
  ...props
}: WebApplicationTargetTableRowProps) => {
  const [_] = useTranslation();

  return (
    <TableRow data-testid={dataTestId}>
      <EntityNameTableData
        displayName={_('Target')}
        entity={entity}
        links={!links}
        type="target"
      />
      <TableData>{entity.url ?? ''}</TableData>
      <TableData>
        <Cred cred={entity.credential} links={links} title={_('Credential')} />
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default WebApplicationTargetRow;
