/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useLayoutEffect, useState} from 'react';
import {Collapse} from '@mantine/core';
import {useReducedMotion} from '@mantine/hooks';
import styled from 'styled-components';
import type Model from 'gmp/models/model';
import {isDefined, isFunction} from 'gmp/utils/identity';
import {DetailsIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import {TableDataContent} from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import {updateDisplayName} from 'web/utils/display-name';
import Theme from 'web/utils/theme';

interface RowDetailsWrapperProps<TEntity> {
  detailsExpanded?: boolean;
  entity: TEntity;
  links?: boolean;
  detailsId?: string;
  onPreviewExited?: (id: string) => void;
}

const Indent = styled.div`
  display: flex;
  width: 3em;
  border-right: 2px solid ${Theme.black};
  margin-right: 1em;
  flex-shrink: 0; /* don't shrink at all */
`;

Indent.displayName = 'Indent';

// Keep the cell's vertical spacing inside the animated height so a collapsed
// details row has no residual height when it is mounted or removed.
const DetailsInset = styled.div`
  padding-top: 4px;
  padding-bottom: 4px;
`;

const StyledTableRow = styled(TableRow)`
  &,
  &:hover {
    background-color: ${Theme.white} !important;
  }
  & td {
    border-bottom: none;
  }
  && > td {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

const withRowDetails =
  <TEntity extends Model, TProps = {}>(
    type: string,
    colSpan: number = 10,
    details: boolean = true,
  ) =>
  (
    Component: React.ComponentType<
      RowDetailsWrapperProps<TEntity> &
        Omit<TProps, keyof RowDetailsWrapperProps<TEntity>>
    >,
  ) => {
    const RowDetailsWrapper = ({
      entity,
      links = true,
      detailsId,
      detailsExpanded = false,
      onPreviewExited,
      ...props
    }: RowDetailsWrapperProps<TEntity> & TProps) => {
      const [_] = useTranslation();
      const shouldReduceMotion = useReducedMotion();
      const [readyToExpand, setReadyToExpand] = useState(false);

      const entityId = entity.id;

      useLayoutEffect(() => {
        if (!detailsExpanded) {
          if (isDefined(entityId) && (!readyToExpand || shouldReduceMotion)) {
            onPreviewExited?.(entityId);
          }
          return;
        }

        if (readyToExpand || shouldReduceMotion) {
          return;
        }

        const frame = window.requestAnimationFrame(() =>
          setReadyToExpand(true),
        );
        return () => window.cancelAnimationFrame(frame);
      }, [
        detailsExpanded,
        entityId,
        onPreviewExited,
        readyToExpand,
        shouldReduceMotion,
      ]);

      return (
        <StyledTableRow id={detailsId}>
          <td colSpan={colSpan}>
            <Collapse
              expanded={
                detailsExpanded && (readyToExpand || shouldReduceMotion)
              }
              keepMounted={false}
              transitionDuration={shouldReduceMotion ? 0 : 200}
              transitionTimingFunction="ease"
              onTransitionEnd={() => {
                if (!detailsExpanded && isDefined(entityId)) {
                  onPreviewExited?.(entityId);
                }
              }}
            >
              <DetailsInset>
                <TableDataContent flex align={['start', 'stretch']}>
                  {links && (
                    <Layout align={['start', 'start']}>
                      {details && (
                        <DetailsLink
                          id={entity.id as string}
                          type={isFunction(type) ? type(entity) : type}
                        >
                          <DetailsIcon
                            size="small"
                            title={_('Open all details')}
                          />
                        </DetailsLink>
                      )}
                    </Layout>
                  )}
                  <Indent />
                  <Layout flex="column" grow="1">
                    <Component
                      {...(props as TProps)}
                      entity={entity}
                      links={links}
                    />
                  </Layout>
                </TableDataContent>
              </DetailsInset>
            </Collapse>
          </td>
        </StyledTableRow>
      );
    };

    return updateDisplayName(RowDetailsWrapper, Component, 'withRowDetails');
  };

export default withRowDetails;
