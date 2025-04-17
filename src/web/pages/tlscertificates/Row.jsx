/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import DateTime from 'web/components/date/DateTime';
import {DownloadIcon} from 'web/components/icon';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
const Div = styled.div`
  word-break: break-all;
`;

const Actions = withEntitiesActions(
  ({
    entity,
    onTlsCertificateDeleteClick,
    onTlsCertificateDownloadClick,
    onTlsCertificateExportClick,
  }) => {
    const [_] = useTranslation();

    return (
      <IconDivider grow align={['center', 'center']}>
        {entity.isInUse() ? (
          <DeleteIcon disabled={true} title={_('TLS Certificate is in use')} />
        ) : (
          <DeleteIcon
            title={_('Delete TLS Certificate')}
            value={entity}
            onClick={onTlsCertificateDeleteClick}
          />
        )}
        <DownloadIcon
          title={_('Download TLS Certificate')}
          value={entity}
          onClick={onTlsCertificateDownloadClick}
        />
        <ExportIcon
          title={_('Export TLS Certificate as XML')}
          value={entity}
          onClick={onTlsCertificateExportClick}
        />
      </IconDivider>
    );
  },
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onTlsCertificateDeleteClick: PropTypes.func.isRequired,
  onTlsCertificateDownloadClick: PropTypes.func.isRequired,
  onTlsCertificateExportClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  onToggleDetailsClick,
  ...props
}) => {
  return (
    <TableRow>
      <TableData>
        <span>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            <Div>{entity.subjectDn}</Div>
          </RowDetailsToggle>
        </span>
      </TableData>
      <TableData>{entity.serial}</TableData>
      <TableData>
        <DateTime date={entity.activationTime} />
      </TableData>
      <TableData>
        <DateTime date={entity.expirationTime} />
      </TableData>
      <TableData>
        <DateTime date={entity.lastSeen} />
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
