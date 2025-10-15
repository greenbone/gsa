/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type PortList from 'gmp/models/portlist';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';

interface PortListDetailsPageToolBarIconsProps {
  entity: PortList;
  onPortListCloneClick?: (entity: PortList) => void;
  onPortListCreateClick?: () => void;
  onPortListDeleteClick?: (entity: PortList) => void;
  onPortListDownloadClick?: (entity: PortList) => void;
  onPortListEditClick?: (entity: PortList) => void;
}

const PortListDetailsPageToolBarIcons = ({
  entity,
  onPortListCloneClick,
  onPortListCreateClick,
  onPortListDeleteClick,
  onPortListDownloadClick,
  onPortListEditClick,
}: PortListDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="creating-and-managing-port-lists"
          page="scanning"
          title={_('Help: Port Lists')}
        />
        <ListIcon page="portlists" title={_('PortList List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onPortListCreateClick} />
        <CloneIcon entity={entity} onClick={onPortListCloneClick} />
        <EditIcon
          disabled={entity.predefined}
          entity={entity}
          onClick={onPortListEditClick}
        />
        <TrashIcon entity={entity} onClick={onPortListDeleteClick} />
        <ExportIcon
          title={_('Export Port List as XML')}
          value={entity}
          onClick={onPortListDownloadClick as (entity?: PortList) => void}
        />
      </IconDivider>
    </Divider>
  );
};

export default PortListDetailsPageToolBarIcons;
