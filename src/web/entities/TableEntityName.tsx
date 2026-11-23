/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import styled from 'styled-components';
import {type EntityType} from 'gmp/utils/entity-type';
import DetailsLink from 'web/components/link/DetailsLink';
import {type RowPreview} from 'web/entities/EntitiesTable';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import useTranslation from 'web/hooks/useTranslation';

interface TableEntityNameProps {
  children: ReactNode;
  id?: string;
  type?: EntityType;
  links?: boolean;
  preview?: RowPreview;
  previewLabel?: string;
}

const NameLayout = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  vertical-align: middle;
`;

const PreviewSlot = styled.span`
  display: inline-flex;
  align-items: center;
  flex: 0 0 36px;
  width: 36px;
`;

const TableEntityName = ({
  children,
  id,
  type,
  links = true,
  preview,
  previewLabel,
}: TableEntityNameProps) => {
  const [_] = useTranslation();
  const label =
    previewLabel ?? (typeof children === 'string' ? children : undefined);
  return (
    <NameLayout>
      <PreviewSlot>
        {preview && (
          <RowDetailsToggle
            detailsExpanded={preview.expanded}
            detailsId={preview.id}
            previewLabel={label}
            onClick={preview.toggle}
          />
        )}
      </PreviewSlot>
      {type ? (
        <DetailsLink
          underline
          id={id ?? ''}
          linkTitle={_('Open details')}
          style={{minWidth: 0, overflowWrap: 'break-word'}}
          textOnly={!links}
          type={type}
        >
          {children}
        </DetailsLink>
      ) : (
        <span>{children}</span>
      )}
    </NameLayout>
  );
};

export default TableEntityName;
