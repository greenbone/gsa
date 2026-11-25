/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {Accordion} from '@mantine/core';
import {EStatus, ICON_SIZES, StatusIcon} from '@greenbone/ui-lib';
import {
  type DirectoryBranch,
  type DirectoryComputer,
  type DirectoryNode,
  type DirectoryOverview,
} from 'gmp/models/active-directory';
import {arraysEqual} from 'gmp/utils/array';
import Badge, {EThemeColors} from 'web/components/badge/StatusBadge';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Button from 'web/components/form/Button';
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
  DirectorySelectionWarning,
} from 'web/pages/active-directory/DirectoryLayout';

interface DirectoryTreeProps {
  nodes: DirectoryNode[];
  sourceId: string;
  selectedIds: ReadonlySet<string>;
  showDisabled: boolean;
  showContainers?: boolean;
  selectionPending: boolean;
  selectionWarning?: {
    id: string;
    path?: string[];
    count: number;
    hasSelectableComputers: boolean;
    onSelectLoaded: () => void;
  };
  memberships: Record<string, DirectoryComputer[]>;
  selectedIncompleteMembers: ReadonlyMap<string, ReadonlySet<string>>;
  redundantBranchSummaries?: string[];
  computerPaths?: Record<string, string>;
  registerVisibleListing: (
    pathKey: string,
    nodes: DirectoryNode[],
  ) => () => void;
  onLoaded: (
    key: string,
    branchId: string,
    listing?: DirectoryOverview,
  ) => void;
  path?: string[];
  onSelect: (node: DirectoryNode, checked: boolean, path?: string[]) => void;
}

interface BranchProps extends Omit<DirectoryTreeProps, 'nodes'> {
  node: DirectoryBranch;
}

interface ExpandedBranchProps extends BranchProps {
  onTruncationChange: (truncated: boolean) => void;
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
  selectionWarning,
  memberships,
  selectedIncompleteMembers,
  redundantBranchSummaries,
  computerPaths,
  registerVisibleListing,
  onLoaded,
  onTruncationChange,
  path,
  onSelect,
}: ExpandedBranchProps) => {
  const [_] = useTranslation();
  const opening = useId();
  const branchPath = [...(path ?? []), node.id];
  const pathKey = JSON.stringify(branchPath);
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
  useEffect(() => {
    if (listing) return registerVisibleListing(pathKey, listing.roots);
  }, [listing, pathKey, registerVisibleListing]);
  useEffect(() => {
    onTruncationChange(!isFetching && !isError && listing?.truncated === true);
  }, [isError, isFetching, listing, onTruncationChange]);
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
      {listing && (
        <DirectoryTree
          computerPaths={computerPaths}
          memberships={memberships}
          nodes={listing.roots}
          path={branchPath}
          redundantBranchSummaries={redundantBranchSummaries}
          registerVisibleListing={registerVisibleListing}
          selectedIds={selectedIds}
          selectedIncompleteMembers={selectedIncompleteMembers}
          selectionPending={selectionPending}
          selectionWarning={selectionWarning}
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
  selectionWarning,
  memberships,
  selectedIncompleteMembers,
  redundantBranchSummaries,
  computerPaths,
  registerVisibleListing,
  onLoaded,
  path,
  onSelect,
}: BranchProps) => {
  const [_] = useTranslation();
  const warningId = useId();
  const branchSelectionRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [listingTruncated, setListingTruncated] = useState(false);

  const branchSelection = getBranchSelectionSummary(
    memberships[node.id],
    selectedIds,
    showDisabled,
  );
  // An unresolved mixed checkbox clears the known selection on activation.
  const clearIncompleteSelection = selectedIncompleteMembers.has(node.id);
  const indeterminate =
    branchSelection.indeterminate || clearIncompleteSelection;
  const cycle = path?.includes(node.id) ?? false;
  const warning =
    selectionWarning?.id === node.id &&
    arraysEqual(selectionWarning.path ?? [], path ?? [])
      ? selectionWarning
      : undefined;
  let warningHint;
  let warningAction: {label: string; onClick: () => void} | undefined;
  if (warning) {
    if (warning.count > 0) {
      const label =
        warning.count === 1
          ? _('Select 1 loaded computer')
          : _('Select {{count}} loaded computers', {count: warning.count});
      warningAction = {label, onClick: warning.onSelectLoaded};
    } else if (warning.hasSelectableComputers) {
      warningHint = _('All loaded selectable computers are already selected.');
    } else if (expanded || cycle) {
      warningHint = _('No selectable computers are loaded in this branch.');
    } else {
      warningHint = _('Expand the branch to load computers.');
      warningAction = {
        label: _('Expand branch'),
        onClick: () => setExpanded(true),
      };
    }
  }
  let selectionBadgeColor = EThemeColors.NeutralLight;
  if (branchSelection.checked) {
    selectionBadgeColor = EThemeColors.Green;
  } else if (indeterminate) {
    selectionBadgeColor = EThemeColors.Blue;
  }
  let branchBadge;
  if (expanded && listingTruncated) {
    branchBadge = (
      <output
        aria-label={_('Partial')}
        title={_(
          '{{name}}: some objects were not returned. You can select the loaded computers.',
          {name: node.name},
        )}
      >
        <Badge color={EThemeColors.Orange} size="sm">
          {_('Partial')}
        </Badge>
      </output>
    );
  } else if (!redundantBranchSummaries?.includes(node.id)) {
    branchBadge = (
      <Badge color={selectionBadgeColor} size="sm">
        {branchSelection.total === undefined
          ? _('Membership not resolved')
          : _('{{selected}} of {{total}} computers selected', {
              selected: branchSelection.selectedCount,
              total: branchSelection.total,
            })}
      </Badge>
    );
  }
  const row = (
    <BranchRow $depth={path?.length ?? 0} data-directory-branch-header="">
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
        {branchBadge}
        <DirectorySelectionWarning>
          <output>
            {warning && (
              <>
                <StatusIcon
                  aria-hidden="true"
                  size={ICON_SIZES.SMALL}
                  status={EStatus.WARNING}
                />
                <span id={warningId}>
                  {_('Could not select the whole branch.')}
                  {warningHint && <> {warningHint}</>}
                </span>
              </>
            )}
          </output>
          {warningAction && (
            <Button
              size="sm"
              styles={{label: {whiteSpace: 'normal', overflow: 'visible'}}}
              title={warningAction.label}
              variant="default"
              onClick={() => {
                if (warning && warning.count > 0)
                  branchSelectionRef.current?.querySelector('input')?.focus();
                warningAction.onClick();
              }}
            />
          )}
        </DirectorySelectionWarning>
      </div>
      <div ref={branchSelectionRef}>
        <EntitySelection
          aria-describedby={warning ? warningId : undefined}
          aria-label={node.name}
          disabled={selectionPending}
          entity={node}
          indeterminate={indeterminate}
          selected={branchSelection.checked}
          onDeselected={() => onSelect(node, false, path)}
          onSelected={() => onSelect(node, !clearIncompleteSelection, path)}
        />
      </div>
    </BranchRow>
  );

  const accordion = (
    <DirectoryAccordion
      value={expanded ? 'details' : null}
      onChange={value => {
        setListingTruncated(false);
        setExpanded(value !== null);
      }}
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
              memberships={memberships}
              node={node}
              path={path}
              redundantBranchSummaries={redundantBranchSummaries}
              registerVisibleListing={registerVisibleListing}
              selectedIds={selectedIds}
              selectedIncompleteMembers={selectedIncompleteMembers}
              selectionPending={selectionPending}
              selectionWarning={selectionWarning}
              showContainers={showContainers}
              showDisabled={showDisabled}
              sourceId={sourceId}
              onLoaded={onLoaded}
              onSelect={onSelect}
              onTruncationChange={setListingTruncated}
            />
          </Accordion.Panel>
        )}
      </Accordion.Item>
    </DirectoryAccordion>
  );

  return (
    <li data-directory-branch-open={expanded ? '' : undefined}>{accordion}</li>
  );
};

const DirectoryTree = ({
  nodes,
  sourceId,
  selectedIds,
  showDisabled,
  showContainers,
  selectionPending,
  selectionWarning,
  memberships,
  selectedIncompleteMembers,
  redundantBranchSummaries,
  computerPaths,
  registerVisibleListing,
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
              memberships={memberships}
              node={node}
              path={path}
              redundantBranchSummaries={redundantBranchSummaries}
              registerVisibleListing={registerVisibleListing}
              selectedIds={selectedIds}
              selectedIncompleteMembers={selectedIncompleteMembers}
              selectionPending={selectionPending}
              selectionWarning={selectionWarning}
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
