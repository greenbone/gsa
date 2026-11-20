/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useId, useMemo, useState} from 'react';
import {Accordion} from '@mantine/core';
import {Alert, EStatus} from '@greenbone/ui-lib';
import {
  type DirectoryBranch,
  type DirectoryComputer,
  type DirectoryNode,
  type DirectoryOverview,
} from 'gmp/models/active-directory';
import Badge, {EThemeColors} from 'web/components/badge/StatusBadge';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Column from 'web/components/layout/Column';
import Loading from 'web/components/loading/Loading';
import EntitySelection from 'web/entities/EntitySelection';
import {useGetActiveDirectoryChildren} from 'web/hooks/use-query/active-directory';
import useTranslation from 'web/hooks/useTranslation';
import ComputerList from 'web/pages/active-directory/ComputerList';
import {getBranchSelectionSummary} from 'web/pages/active-directory/directory-selection';
import DirectoryAccordion from 'web/pages/active-directory/DirectoryAccordion';
import {
  BranchRow,
  DirectoryBranchContent,
  DirectoryEmptyNotice,
  DirectoryHeader,
  DirectoryList,
} from 'web/pages/active-directory/DirectoryLayout';

interface DirectoryTreeProps {
  nodes: DirectoryNode[];
  sourceId: string;
  selectedIds: ReadonlySet<string>;
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
  selectedIds,
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
    <DirectoryBranchContent
      $topLevel={!path?.length}
      aria-busy={isFetching}
      gap="xs"
      miw={0}
      pb="xs"
    >
      {isFetching && !isError && (
        <Loading label={_('Loading {{- name}}', {name: node.name})} />
      )}
      {isError && (
        <ErrorPanel
          action={{
            label: _('Retry {{- name}}', {name: node.name}),
            onClick: () => void refetch(),
            isLoading: isFetching,
          }}
          details={error instanceof Error ? error.message : undefined}
          message={_('Could not load this branch.')}
        />
      )}
      {listing?.truncated && (
        <Alert
          dismissible={false}
          role="status"
          title={_(
            '{{name}}: some objects were not returned. You can select the loaded computers.',
            {name: node.name},
          )}
          type={EStatus.WARNING}
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
          selectedIds={selectedIds}
          selectionPending={selectionPending}
          showContainers={showContainers}
          showDisabled={showDisabled}
          sourceId={sourceId}
          onLoaded={onLoaded}
          onSelect={onSelect}
        />
      )}
    </DirectoryBranchContent>
  );
};

const DirectoryTreeNode = ({
  node,
  sourceId,
  selectedIds,
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
    selectedIds,
    showDisabled,
  );
  if (memberships[node.id] === undefined) {
    branchSelection.indeterminate = (knownMembers[node.id] ?? []).some(member =>
      selectedIds.has(member.id),
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

  const accordion = (
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
              selectedIds={selectedIds}
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
  );

  return <li>{accordion}</li>;
};

const DirectoryTree = ({
  nodes,
  sourceId,
  selectedIds,
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
  const pathKey = JSON.stringify(path ?? []);
  const computers = useMemo(
    () =>
      nodes.filter(
        (node): node is DirectoryComputer =>
          node.kind === 'computer' &&
          (showDisabled || !node.disabled) &&
          (!computerPaths || computerPaths[node.id] === pathKey),
      ),
    [computerPaths, nodes, pathKey, showDisabled],
  );
  const branches = nodes.filter(node => node.kind !== 'computer');
  return branches.length === 0 && computers.length === 0 ? (
    <DirectoryEmptyNotice
      $ownerDepth={path?.length ? path.length - 1 : undefined}
    >
      {nodes.some(
        node =>
          node.kind === 'computer' &&
          computerPaths?.[node.id] !== undefined &&
          computerPaths[node.id] !== pathKey,
      )
        ? _('These computers are shown in another directory group.')
        : _('No visible directory objects.')}
    </DirectoryEmptyNotice>
  ) : (
    <Column gap="xs" miw={0}>
      {branches.length > 0 && (
        <DirectoryList $spacing={path?.length ? 'xs' : 'sm'}>
          {branches.map(node => (
            <DirectoryTreeNode
              key={node.id}
              computerPaths={computerPaths}
              knownMembers={knownMembers}
              memberships={memberships}
              node={node}
              path={path}
              redundantBranchSummaries={redundantBranchSummaries}
              selectedIds={selectedIds}
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
      {computers.length > 0 && (
        <div>
          <DirectoryHeader $depth={path?.length ?? 0}>
            <span>{_('Computer')}</span>
            <span>{_('Operating system')}</span>
            <span>{_('Scan targets')}</span>
            <span aria-hidden="true" />
          </DirectoryHeader>
          <ComputerList
            computers={computers}
            depth={path?.length ?? 0}
            selectedIds={selectedIds}
            selectionPending={selectionPending}
            sourceId={sourceId}
            onSelect={(node, checked) => onSelect(node, checked, path)}
          />
        </div>
      )}
    </Column>
  );
};

export default DirectoryTree;
