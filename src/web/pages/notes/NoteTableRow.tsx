/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {shorten} from 'gmp/utils/string';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import {type RowPreview} from 'web/entities/EntitiesTable';
import TableEntityName from 'web/entities/TableEntityName';
import useTranslation from 'web/hooks/useTranslation';
import NoteTableActions, {
  type NoteTableActionsProps,
} from 'web/pages/notes/NoteTableActions';

export interface NoteTableRowProps extends NoteTableActionsProps {
  links?: boolean;
  actionsComponent?: React.ComponentType<NoteTableActionsProps>;
  preview?: RowPreview;
}

const NoteTableRow = ({
  actionsComponent: ActionsComponent = NoteTableActions,
  entity,
  links = true,
  preview,
  ...props
}: NoteTableRowProps) => {
  const [_] = useTranslation();
  const text = (
    <span>
      {entity.isOrphan() && (
        <span>
          <b>{_('Orphan')}</b>
          <br />
        </span>
      )}
      {shorten(entity.text)}
    </span>
  );
  return (
    <TableRow>
      <TableData>
        <span>
          <TableEntityName
            id={entity.id}
            links={links}
            preview={preview}
            previewLabel={shorten(entity.text)}
            type="note"
          >
            {text}
          </TableEntityName>
        </span>
      </TableData>
      <TableData>{entity.nvt ? entity.nvt.name : ''}</TableData>
      <TableData title={entity.hosts.join(', ')}>
        {shorten(entity.hosts.join(', '))}
      </TableData>
      <TableData title={entity.port}>{shorten(entity.port)}</TableData>
      <TableData>{entity.isActive() ? _('yes') : _('no')}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default NoteTableRow;
