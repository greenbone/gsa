/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useId, useState} from 'react';
import {Accordion} from '@mantine/core';
import {
  type DirectoryBranch,
  type DirectoryComputer,
  type DirectoryNode,
  type DirectoryOverview,
} from 'gmp/models/active-directory';
import Badge, {EThemeColors} from 'web/components/badge/StatusBadge';
import Column from 'web/components/layout/Column';
import Loading from 'web/components/loading/Loading';
import InlineNotification from 'web/components/notification/InlineNotification';
import EntitySelection from 'web/entities/EntitySelection';
import {useGetActiveDirectoryChildren} from 'web/hooks/use-query/active-directory';
import useTranslation from 'web/hooks/useTranslation';
import ComputerRow from 'web/pages/active-directory/ComputerRow';
import {getBranchSelectionSummary} from 'web/pages/active-directory/directory-selection';
import DirectoryAccordion from 'web/pages/active-directory/DirectoryAccordion';
import {
  BranchRow,
  DirectoryHeader,
  DirectoryList,
} from 'web/pages/active-directory/DirectoryLayout';
import DirectoryPanel from 'web/pages/active-directory/DirectoryPanel';

interface DirectoryTreeProps {
  nodes: DirectoryNode[];
  sourceId: string;
  selected: DirectoryComputer[];
  showDisabled: boolean;
  showContainers?: boolean;
  selectionPending: boolean;
  memberships: Record<string, DirectoryComputer[]>;
  knownMembers: Record<string, DirectoryComputer[]>;
  redundantBranchSummaries?: string[];
  computerPaths?: Record<string, string>;
  onLoaded: (
    key: string,
    branchId: string,
    listing?: DirectoryOverview,
  ) => void;
  path?: string[];
  onSelect: (node: DirectoryNode, checked: boolean, path?: string[]) => void;
}

interface ExpandedBranchProps extends Omit<DirectoryTreeProps, 'nodes'> {
  node: DirectoryBranch;
}

// This component unmounts on collapse, releasing its query observer and data.
// Its next mount gets a fresh opening identity from the query hook.
const ExpandedBranch = ({
  node,
  sourceId,
  selected,
  showDisabled,
  showContainers,
  selectionPending,
  memberships,
  knownMembers,
  redundantBranchSummaries,
  computerPaths,
  onLoaded,
  path,
  onSelect,
}: ExpandedBranchProps) => {
  const [_] = useTranslation();
  const opening = useId();
  const {
    data: listing,
    error,
    isFetching,
    isError,
    refetch,
  } = useGetActiveDirectoryChildren({
    sourceId,
    branchId: node.id,
    kind: node.kind,
    showContainers,
  });
  useEffect(() => {
    onLoaded(opening, node.id);
  }, [node.id, onLoaded, opening]);
  useEffect(() => {
    if (listing) onLoaded(opening, node.id, listing);
  }, [listing, node.id, onLoaded, opening]);
  return (
    <Column aria-busy={isFetching} gap="xs" miw={0} pt="sm">
      {isFetching && (
        <output aria-label={_('Loading {{- name}}', {name: node.name})}>
          <Loading />
        </output>
      )}
      {isError && (
        <InlineNotification
          action={{
            label: _('Retry {{- name}}', {name: node.name}),
            onClick: () => void refetch(),
            isLoading: isFetching,
          }}
          details={error instanceof Error ? error.message : undefined}
          message={_('Could not load this branch.')}
          severity="error"
        />
      )}
      {listing?.truncated && (
        <InlineNotification
          message={_(
            '{{name}}: some objects were not returned. You can select the loaded computers.',
            {name: node.name},
          )}
          severity="warning"
        />
      )}
      {listing && (
        <DirectoryTree
          computerPaths={computerPaths}
          knownMembers={knownMembers}
          memberships={memberships}
          nodes={listing.roots}
          path={[...(path ?? []), node.id]}
          redundantBranchSummaries={redundantBranchSummaries}
          selected={selected}
          selectionPending={selectionPending}
          showContainers={showContainers}
          showDisabled={showDisabled}
          sourceId={sourceId}
          onLoaded={onLoaded}
          onSelect={onSelect}
        />
      )}
    </Column>
  );
};

const DirectoryTreeNode = ({
  node,
  sourceId,
  selected,
  showDisabled,
  showContainers,
  selectionPending,
  memberships,
  knownMembers,
  redundantBranchSummaries,
  computerPaths,
  onLoaded,
  path,
  onSelect,
}: ExpandedBranchProps) => {
  const [_] = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const branchSelection = getBranchSelectionSummary(
    memberships[node.id],
    selected,
    showDisabled,
  );
  if (memberships[node.id] === undefined) {
    branchSelection.indeterminate = (knownMembers[node.id] ?? []).some(member =>
      selected.some(computer => computer.id === member.id),
    );
  }
  const cycle = path?.includes(node.id) ?? false;
  let selectionBadgeColor = EThemeColors.NeutralLight;
  if (branchSelection.checked) {
    selectionBadgeColor = EThemeColors.Green;
  } else if (branchSelection.indeterminate) {
    selectionBadgeColor = EThemeColors.Blue;
  }
  const selection = branchSelection;
  const row = (
    <BranchRow $depth={path?.length ?? 0}>
      <div>
        {cycle ? (
          node.name
        ) : (
          <Accordion.Control
            aria-label={
              expanded
                ? _('Collapse {{- name}}', {name: node.name})
                : _('Expand {{- name}}', {name: node.name})
            }
          >
            {node.name}
          </Accordion.Control>
        )}
      </div>
      <div>
        {!redundantBranchSummaries?.includes(node.id) && (
          <Badge color={selectionBadgeColor} size="sm">
            {branchSelection.total === undefined
              ? _('Membership not resolved')
              : _('{{selected}} of {{total}} computers selected', {
                  selected: branchSelection.selectedCount,
                  total: branchSelection.total,
                })}
          </Badge>
        )}
      </div>
      <div>
        <EntitySelection
          aria-label={node.name}
          disabled={selectionPending}
          entity={node}
          indeterminate={selection.indeterminate}
          selected={selection.checked}
          onDeselected={() => onSelect(node, false, path)}
          onSelected={() => onSelect(node, true, path)}
        />
      </div>
    </BranchRow>
  );

  return (
    <li>
      <DirectoryPanel paddingInline="0">
        <DirectoryAccordion
          value={expanded ? 'details' : null}
          onChange={value => setExpanded(value !== null)}
        >
          <Accordion.Item value="details">
            {row}
            {cycle ? (
              <p>
                {_(
                  'Circular group membership; this branch is already shown above.',
                )}
              </p>
            ) : (
              <Accordion.Panel>
                <ExpandedBranch
                  computerPaths={computerPaths}
                  knownMembers={knownMembers}
                  memberships={memberships}
                  node={node}
                  path={path}
                  redundantBranchSummaries={redundantBranchSummaries}
                  selected={selected}
                  selectionPending={selectionPending}
                  showContainers={showContainers}
                  showDisabled={showDisabled}
                  sourceId={sourceId}
                  onLoaded={onLoaded}
                  onSelect={onSelect}
                />
              </Accordion.Panel>
            )}
          </Accordion.Item>
        </DirectoryAccordion>
      </DirectoryPanel>
    </li>
  );
};

const DirectoryTree = ({
  nodes,
  sourceId,
  selected,
  showDisabled,
  showContainers,
  selectionPending,
  memberships,
  knownMembers,
  redundantBranchSummaries,
  computerPaths,
  onLoaded,
  path,
  onSelect,
}: DirectoryTreeProps) => {
  const [_] = useTranslation();
  const visible = nodes.filter(
    node =>
      node.kind !== 'computer' ||
      ((showDisabled || !node.disabled) &&
        (!computerPaths ||
          computerPaths[node.id] === JSON.stringify(path ?? []))),
  );
  return visible.length === 0 ? (
    <p>
      {nodes.some(
        node =>
          node.kind === 'computer' &&
          computerPaths?.[node.id] !== undefined &&
          computerPaths[node.id] !== JSON.stringify(path ?? []),
      )
        ? _('These computers are shown in another directory group.')
        : _('No visible directory objects.')}
    </p>
  ) : (
    <Column gap="xs" miw="36rem">
      {visible.some(node => node.kind !== 'computer') && (
        <DirectoryList $spacing="sm">
          {visible
            .filter(node => node.kind !== 'computer')
            .map(node => (
              <DirectoryTreeNode
                key={node.id}
                computerPaths={computerPaths}
                knownMembers={knownMembers}
                memberships={memberships}
                node={node}
                path={path}
                redundantBranchSummaries={redundantBranchSummaries}
                selected={selected}
                selectionPending={selectionPending}
                showContainers={showContainers}
                showDisabled={showDisabled}
                sourceId={sourceId}
                onLoaded={onLoaded}
                onSelect={onSelect}
              />
            ))}
        </DirectoryList>
      )}
      {visible.some(node => node.kind === 'computer') && (
        <div>
          <DirectoryHeader $depth={path?.length ?? 0}>
            <span>{_('Computer')}</span>
            <span>{_('Operating system')}</span>
            <span>{_('Scan targets')}</span>
            <span aria-hidden="true" />
          </DirectoryHeader>
          <DirectoryList $spacing="xs">
            {visible.flatMap(node =>
              node.kind === 'computer'
                ? [
                    <ComputerRow
                      key={node.id}
                      checked={selected.some(
                        selected => selected.id === node.id,
                      )}
                      depth={path?.length ?? 0}
                      node={node}
                      selectionPending={selectionPending}
                      sourceId={sourceId}
                      onSelect={checked => onSelect(node, checked, path)}
                    />,
                  ]
                : [],
            )}
          </DirectoryList>
        </div>
      )}
    </Column>
  );
};

export default DirectoryTree;
