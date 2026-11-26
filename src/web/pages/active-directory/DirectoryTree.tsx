/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useId, useMemo, useState} from 'react';
import {Accordion} from '@mantine/core';
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
import {useGetActiveDirectoryChildren} from 'web/hooks/use-query/active-directory';
import useTranslation from 'web/hooks/useTranslation';
import ComputerRow from 'web/pages/active-directory/ComputerRow';
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
  showDisabled: boolean;
  showContainers?: boolean;
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
}

interface BranchProps extends Omit<DirectoryTreeProps, 'nodes'> {
  node: DirectoryBranch;
}

interface ExpandedBranchProps extends BranchProps {
  onListingApplied: (truncated: boolean) => void;
}

// This component unmounts on collapse, releasing its query observer and data.
// Its next mount gets a fresh opening identity from the query hook.
const ExpandedBranch = ({
  node,
  sourceId,
  showDisabled,
  showContainers,
  computerPaths,
  registerVisibleListing,
  onLoaded,
  onListingApplied,
  path,
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
    if (!listing || isFetching || isError) return;
    onLoaded(opening, node.id, listing);
    onListingApplied(listing.truncated);
  }, [
    isError,
    isFetching,
    listing,
    node.id,
    onListingApplied,
    onLoaded,
    opening,
  ]);
  useEffect(() => {
    if (listing) return registerVisibleListing(pathKey, listing.roots);
  }, [listing, pathKey, registerVisibleListing]);
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
          nodes={listing.roots}
          path={branchPath}
          registerVisibleListing={registerVisibleListing}
          showContainers={showContainers}
          showDisabled={showDisabled}
          sourceId={sourceId}
          onLoaded={onLoaded}
        />
      )}
    </DirectoryBranchContent>
  );
};

const DirectoryTreeNode = ({
  node,
  sourceId,
  showDisabled,
  showContainers,
  computerPaths,
  registerVisibleListing,
  onLoaded,
  path,
}: BranchProps) => {
  const [_] = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [listingTruncated, setListingTruncated] = useState(false);
  const cycle = path?.includes(node.id) ?? false;
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
      {expanded && listingTruncated && (
        <div>
          <output
            title={_('{{name}}: some objects were not returned.', {
              name: node.name,
            })}
          >
            <Badge color={EThemeColors.Orange} size="sm">
              {_('Partial')}
            </Badge>
          </output>
        </div>
      )}
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
              node={node}
              path={path}
              registerVisibleListing={registerVisibleListing}
              showContainers={showContainers}
              showDisabled={showDisabled}
              sourceId={sourceId}
              onListingApplied={setListingTruncated}
              onLoaded={onLoaded}
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
  showDisabled,
  showContainers,
  computerPaths,
  registerVisibleListing,
  onLoaded,
  path,
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
              node={node}
              path={path}
              registerVisibleListing={registerVisibleListing}
              showContainers={showContainers}
              showDisabled={showDisabled}
              sourceId={sourceId}
              onLoaded={onLoaded}
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
          </DirectoryHeader>
          <DirectoryList $spacing="xs">
            {computers.map(node => (
              <ComputerRow key={node.id} depth={path?.length} node={node} />
            ))}
          </DirectoryList>
        </div>
      )}
    </Column>
  );
};

export default DirectoryTree;
