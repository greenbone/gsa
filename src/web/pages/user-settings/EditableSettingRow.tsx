/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import styled from 'styled-components';
import {EditIcon, SaveIcon, XIcon, ResetIcon} from 'web/components/icon';
import InfoTip from 'web/components/info-tip/InfoTip';
import Layout from 'web/components/layout/Layout';
import Row from 'web/components/layout/Row';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface EditableSettingRowProps {
  title?: string;
  label: string;
  infoMessage?: string;
  isEditMode: boolean;
  disableEditIcon?: boolean;
  editComponent: ReactNode;
  viewComponent: ReactNode;
  errorMessage?: string;
  onSave: () => Promise<void>;
  onClear?: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

const ErrorMessage = styled.div`
  color: ${Theme.errorRed};
  margin-top: 5px;
  font-size: 0.9em;
`;

const StyledIconsRow = styled(Layout)`
  gap: 8px;
  align-items: center;
`;

const StyledTableRow = styled(TableRow)`
  height: 90px;
`;

const EditableSettingRow = ({
  title,
  label,
  infoMessage,
  isEditMode,
  disableEditIcon = false,
  editComponent,
  viewComponent,
  errorMessage,
  onSave,
  onCancel,
  onClear,
  onEdit,
}: EditableSettingRowProps) => {
  const [_] = useTranslation();

  return (
    <StyledTableRow title={title}>
      <TableData>
        <Row gap="4px">
          {label}
          {infoMessage && <InfoTip position="right">{infoMessage}</InfoTip>}
        </Row>
      </TableData>

      <TableData>
        {isEditMode ? editComponent : viewComponent}
        {isEditMode && errorMessage && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
      </TableData>
      <TableData>
        <Layout>
          {isEditMode ? (
            <StyledIconsRow>
              <SaveIcon title={_('Save')} onClick={onSave} />
              <ResetIcon title={_('Clear')} onClick={onClear} />
              <XIcon title={_('Cancel')} onClick={onCancel} />
            </StyledIconsRow>
          ) : (
            !disableEditIcon && <EditIcon title={label} onClick={onEdit} />
          )}
        </Layout>
      </TableData>
    </StyledTableRow>
  );
};

export default EditableSettingRow;
