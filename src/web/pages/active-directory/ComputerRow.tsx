/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, useState} from 'react';
import {Accordion} from '@mantine/core';
import styled from 'styled-components';
import {type DirectoryComputer} from 'gmp/models/active-directory';
import Badge, {EThemeColors} from 'web/components/badge/StatusBadge';
import ErrorPanel from 'web/components/error/ErrorPanel';
import HighlightBox from 'web/components/highlight-box';
import Row from 'web/components/layout/Row';
import EntitySelection from 'web/entities/EntitySelection';
import {useGetActiveDirectoryComputerDetails} from 'web/hooks/use-query/active-directory';
import useTranslation from 'web/hooks/useTranslation';
import ComputerDetails from 'web/pages/active-directory/ComputerDetails';
import DirectoryAccordion from 'web/pages/active-directory/DirectoryAccordion';
import {
  ComputerDetailsInset,
  ComputerDirectoryRow,
  ComputerMetadataLabel,
} from 'web/pages/active-directory/DirectoryLayout';

interface VirtualComputerRow {
  index: number;
  total: number;
  spaceBefore?: number;
  measure: (element: HTMLLIElement | null) => void;
}

const HostnameBadge = styled(Badge)`
  height: auto;
  min-height: 1.25rem;
  max-inline-size: 100%;
  overflow-wrap: anywhere;
  white-space: normal;
`;

const ComputerDisclosure = styled(Row)`
  > button {
    min-width: 0;
    width: auto;
  }
`;

const ExpandedComputerDetails = ({
  node,
  sourceId,
}: {
  node: DirectoryComputer;
  sourceId: string;
}) => {
  const [_] = useTranslation();
  const {data, isError, isFetched, isFetching, refetch} =
    useGetActiveDirectoryComputerDetails(sourceId, node.id);

  const retrying = isFetching && isFetched && data === undefined;
  let feedback: ReactNode;
  if (isError || retrying) {
    feedback = (
      <ErrorPanel
        action={{
          label: _('Retry'),
          onClick: () => void refetch(),
          isLoading: retrying,
        }}
        message={_('Could not load computer details.')}
      />
    );
  }

  return (
    <ComputerDetails
      details={data}
      feedback={feedback}
      loading={isFetching && data === undefined && !retrying}
      node={node}
    />
  );
};

const ComputerRow = ({
  node,
  sourceId,
  checked,
  selectionPending,
  depth = 0,
  virtualRow,
  onExpandedChange,
  onFocusChange,
  onSelect,
}: {
  node: DirectoryComputer;
  sourceId: string;
  checked: boolean;
  selectionPending: boolean;
  depth?: number;
  virtualRow?: VirtualComputerRow;
  onExpandedChange?: (expanded: boolean) => void;
  onFocusChange?: (focused: boolean) => void;
  onSelect: (checked: boolean) => void;
}) => {
  const [_] = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const missingHostnameLabel = node.hostname ? undefined : _('No DNS hostname');
  const selectionDisabledReason =
    missingHostnameLabel ??
    (selectionPending
      ? _('Resolving selected OU/group recursively...')
      : undefined);
  const disclosure = (
    <Accordion.Control
      aria-label={_('Computer details for {{name}}', {name: node.name})}
      title={expanded ? _('Hide computer details') : _('Show computer details')}
    >
      {node.name}
    </Accordion.Control>
  );
  const targets = node.matchedTargets;
  let targetSummary: ReactNode;
  if (targets === undefined) {
    targetSummary = _('Matching information unavailable');
  } else if (targets.length === 0) {
    targetSummary = _('No matching readable scan targets');
  } else {
    targetSummary = (
      <span>
        {targets[0].name}
        {targets.length > 1 && (
          <> {_('+{{count}} more', {count: targets.length - 1})}</>
        )}
      </span>
    );
  }
  return (
    <li
      ref={virtualRow?.measure}
      aria-posinset={virtualRow ? virtualRow.index + 1 : undefined}
      aria-setsize={virtualRow?.total}
      data-index={virtualRow?.index}
      style={
        virtualRow?.spaceBefore === undefined
          ? undefined
          : {marginBlockStart: virtualRow.spaceBefore}
      }
      onBlurCapture={
        onFocusChange
          ? event => {
              if (!event.currentTarget.contains(event.relatedTarget))
                onFocusChange(false);
            }
          : undefined
      }
      onFocusCapture={onFocusChange ? () => onFocusChange(true) : undefined}
    >
      <DirectoryAccordion
        value={expanded ? 'details' : null}
        onChange={value => {
          const open = value !== null;
          setExpanded(open);
          onExpandedChange?.(open);
        }}
      >
        <Accordion.Item value="details">
          <ComputerDirectoryRow $depth={depth}>
            <div>
              {missingHostnameLabel !== undefined ? (
                <ComputerDisclosure gap="xs" wrap="wrap">
                  {disclosure}
                  <span
                    title={_(
                      'This computer cannot be transferred to a target.',
                    )}
                  >
                    <HostnameBadge color={EThemeColors.Orange} size="sm">
                      {missingHostnameLabel}
                    </HostnameBadge>
                  </span>
                </ComputerDisclosure>
              ) : (
                disclosure
              )}
              {node.disabled && (
                <small>{_('Disabled Active Directory object')}</small>
              )}
            </div>
            <div>
              <ComputerMetadataLabel>
                {_('Operating system')}
              </ComputerMetadataLabel>
              {node.operatingSystem || _('Not provided')}
            </div>
            <div>
              <ComputerMetadataLabel>{_('Scan targets')}</ComputerMetadataLabel>
              {targetSummary}
            </div>
            <div title={selectionDisabledReason}>
              <EntitySelection
                aria-label={node.name}
                disabled={selectionPending || !node.hostname}
                entity={node}
                selected={checked}
                onDeselected={() => onSelect(false)}
                onSelected={() => onSelect(true)}
              />
            </div>
          </ComputerDirectoryRow>
          <Accordion.Panel>
            <ComputerDetailsInset $depth={depth}>
              <HighlightBox>
                {expanded && (
                  <ExpandedComputerDetails node={node} sourceId={sourceId} />
                )}
              </HighlightBox>
            </ComputerDetailsInset>
          </Accordion.Panel>
        </Accordion.Item>
      </DirectoryAccordion>
    </li>
  );
};

export default ComputerRow;
