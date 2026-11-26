/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {memo, type ReactNode, useState} from 'react';
import {Accordion} from '@mantine/core';
import styled from 'styled-components';
import {type DirectoryComputer} from 'gmp/models/active-directory';
import {isDefined} from 'gmp/utils/identity';
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

  const retrying = isFetching && isFetched && !isDefined(data);
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
      loading={isFetching && !isDefined(data) && !retrying}
      node={node}
    />
  );
};

const ComputerRow = memo(function ComputerRow({
  node,
  sourceId,
  checked,
  selectionPending,
  depth = 0,
  measure,
  spaceBefore,
  virtualIndex,
  virtualTotal,
  onExpandedChange,
  onFocusChange,
  onSelect,
}: {
  node: DirectoryComputer;
  sourceId: string;
  checked: boolean;
  selectionPending: boolean;
  depth?: number;
  measure?: (element: HTMLLIElement | null) => void;
  spaceBefore?: number;
  virtualIndex?: number;
  virtualTotal?: number;
  onExpandedChange?: (id: string, expanded: boolean) => void;
  onFocusChange?: (id: string, focused: boolean) => void;
  onSelect: (computer: DirectoryComputer, checked: boolean) => void;
}) {
  const [_] = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [opening, setOpening] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);
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
  if (!isDefined(targets)) {
    targetSummary = _('Matching information unavailable');
  } else if (targets.length === 0) {
    targetSummary = _('No matching readable scan targets');
  } else {
    targetSummary = (
      <Row gap="xs" wrap="wrap">
        <span>{targets[0].name}</span>
        {targets.length > 1 && (
          <Badge color={EThemeColors.NeutralLight} size="sm">
            {_('+{{count}} more', {count: targets.length - 1})}
          </Badge>
        )}
      </Row>
    );
  }
  return (
    <li
      ref={measure}
      aria-posinset={!isDefined(virtualIndex) ? undefined : virtualIndex + 1}
      aria-setsize={virtualTotal}
      data-index={virtualIndex}
      style={
        !isDefined(spaceBefore) ? undefined : {marginBlockStart: spaceBefore}
      }
      onBlurCapture={
        onFocusChange
          ? event => {
              if (!event.currentTarget.contains(event.relatedTarget))
                onFocusChange(node.id, false);
            }
          : undefined
      }
      onFocusCapture={
        onFocusChange ? () => onFocusChange(node.id, true) : undefined
      }
    >
      <DirectoryAccordion
        transitionDuration={transitionDuration}
        value={expanded ? 'details' : null}
        onChange={value => {
          const open = value !== null;
          const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches;
          setTransitionDuration(reducedMotion ? 0 : 150);
          // Reopening starts a fresh query even during the closing transition.
          if (open) setOpening(previous => previous + 1);
          setExpanded(open);
          onExpandedChange?.(node.id, open);
        }}
      >
        <Accordion.Item value="details">
          <ComputerDirectoryRow $depth={depth}>
            <div>
              {isDefined(missingHostnameLabel) ? (
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
                onDeselected={() => onSelect(node, false)}
                onSelected={() => onSelect(node, true)}
              />
            </div>
          </ComputerDirectoryRow>
          <Accordion.Panel>
            <ComputerDetailsInset $depth={depth}>
              <HighlightBox>
                {opening > 0 && (
                  <ExpandedComputerDetails
                    key={opening}
                    node={node}
                    sourceId={sourceId}
                  />
                )}
              </HighlightBox>
            </ComputerDetailsInset>
          </Accordion.Panel>
        </Accordion.Item>
      </DirectoryAccordion>
    </li>
  );
});

export default ComputerRow;
