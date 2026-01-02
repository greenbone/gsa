/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Model from 'gmp/models/model';
import type OciImageTarget from 'gmp/models/oci-image-target';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
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

export interface ContainerImageTargetActionsProps extends Omit<
  EntitiesActionsProps<OciImageTarget>,
  'children'
> {
  onContainerImageTargeEditClick?: (target: OciImageTarget) => void;
  onContainerImageTargetCloneClick?: (target: OciImageTarget) => void;
  onContainerImageTargetDownloadClick?: (target: OciImageTarget) => void;
  onContainerImageTargetDeleteClick?: (target: OciImageTarget) => void;
}

export interface ContainerImageTargetTableRowProps
  extends ContainerImageTargetActionsProps, RowComponentProps<OciImageTarget> {
  actionsComponent?: React.ComponentType<ContainerImageTargetActionsProps>;
  links?: boolean;
  'data-testid'?: string;
}

const Actions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onContainerImageTargeEditClick,
  onContainerImageTargetCloneClick,
  onContainerImageTargetDownloadClick,
  onContainerImageTargetDeleteClick,
}: ContainerImageTargetActionsProps) => {
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
          displayName={_('Container Image Target')}
          entity={entity}
          name="ociimagetarget"
          onClick={onContainerImageTargetDeleteClick}
        />
        <EditIcon
          displayName={_('Container Image Target')}
          entity={entity}
          name="ociimagetarget"
          onClick={onContainerImageTargeEditClick}
        />
        <CloneIcon
          displayName={_('Container Image Target')}
          entity={entity}
          name="ociimagetarget"
          title={_('Clone Container Image Target')}
          onClick={onContainerImageTargetCloneClick}
        />
        <ExportIcon
          title={_('Export Container Image Target')}
          value={entity}
          onClick={onContainerImageTargetDownloadClick}
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

const ContainerImageTargetRow = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  'data-testid': dataTestId,
  ...props
}: ContainerImageTargetTableRowProps) => {
  const [_] = useTranslation();

  return (
    <TableRow data-testid={dataTestId}>
      <EntityNameTableData
        displayName={_('Target')}
        entity={entity}
        links={!links}
        type="target"
      />
      <TableData>{shorten(entity.imageReferences.join(', '), 500)}</TableData>
      <TableData>
        <Cred cred={entity.credential} links={links} title={_('Credential')} />
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default ContainerImageTargetRow;
