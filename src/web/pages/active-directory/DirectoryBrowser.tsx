/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, EStatus} from '@greenbone/ui-lib';
import {
  type DirectoryComputer,
  type DirectoryNode,
  type DirectoryOverview,
} from 'gmp/models/active-directory';
import {
  emptyDirectoryGraph,
  beginDirectorySnapshot,
  replaceDirectorySnapshot,
  mergeDirectoryGraph,
  getDirectoryMembers,
  getDirectoryComputerPaths,
} from 'gmp/models/directory-graph';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Button from 'web/components/form/Button';
import Checkbox from 'web/components/form/Checkbox';
import InfoTip from 'web/components/info-tip/InfoTip';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import Loading from 'web/components/loading/Loading';
import {
  useGetActiveDirectoryOverview,
  useResolveActiveDirectorySubtree,
} from 'web/hooks/use-query/active-directory';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {
  mergeSelection,
  selectedHostnames,
} from 'web/pages/active-directory/directory-selection';
import {
  DirectoryFooter,
  DirectoryHeading,
  DirectoryScrollArea,
  DirectoryToolbar,
  DirectoryWorkspace,
} from 'web/pages/active-directory/DirectoryLayout';
import DirectoryTree from 'web/pages/active-directory/DirectoryTree';
import DiscoverySummary from 'web/pages/active-directory/DiscoverySummary';

interface DirectoryBrowserProps {
  sourceId: string;
  onApply: (hosts: string[]) => void;
}

export const DirectoryBrowser = ({
  sourceId,
  onApply,
}: DirectoryBrowserProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const [showContainers, setShowContainers] = useState(false);
  const [listingVersion, setListingVersion] = useState(0);
  const listingVersionRef = useRef(0);
  const {
    data: overview,
    error: overviewError,
    isFetching: loading,
    isError: loadError,
    refetch: reloadOverview,
  } = useGetActiveDirectoryOverview(sourceId, showContainers, listingVersion);
  const [graph, setGraph] = useState(emptyDirectoryGraph);
  const graphRevision = useRef(0);
  const currentGraph = overview
    ? replaceDirectorySnapshot(
        graph,
        'directory-root',
        'overview',
        overview.roots,
        !overview.truncated,
      )
    : graph;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selected = selectedIds.flatMap(id => {
    const node = currentGraph.nodes[id];
    return node?.kind === 'computer' ? [node] : [];
  });
  const selectedComputerIds = new Set(selected.map(computer => computer.id));
  const setSelected = (
    update: (previous: DirectoryComputer[]) => DirectoryComputer[],
  ) => {
    setSelectedIds(previous =>
      update(
        previous.flatMap(id => {
          const node = currentGraph.nodes[id];
          return node?.kind === 'computer' ? [node] : [];
        }),
      ).map(node => node.id),
    );
  };
  const [showDisabled, setShowDisabled] = useState(false);
  const [selectionError, setSelectionError] = useState<DirectoryNode>();
  const [resolutionError, setResolutionError] = useState<string>();
  const onLoaded = useCallback(
    (owner: string, branchId: string, listing?: DirectoryOverview) => {
      if (listingVersion !== listingVersionRef.current) return;
      graphRevision.current += 1;
      setGraph(previous => {
        if (!listing) return beginDirectorySnapshot(previous, branchId, owner);
        if (previous.branches[branchId]?.owner !== owner) return previous;
        return replaceDirectorySnapshot(
          previous,
          branchId,
          owner,
          listing.roots,
          !listing.truncated,
        );
      });
    },
    [listingVersion],
  );
  const version = useRef(0);
  const {
    mutateAsync: resolveSubtree,
    reset: resetResolution,
    isPending: resolving,
  } = useResolveActiveDirectorySubtree();

  useEffect(
    () => () => {
      version.current += 1;
      resetResolution();
    },
    [resetResolution],
  );

  const select = async (node: DirectoryNode, checked: boolean) => {
    const currentVersion = ++version.current;
    const revision = graphRevision.current;
    setSelectionError(undefined);
    setResolutionError(undefined);
    if (!checked) {
      const memberIds = new Set(
        node.kind === 'computer'
          ? [node.id]
          : (knownMembers[node.id] ?? []).map(member => member.id),
      );
      setSelected(previous =>
        previous.filter(computer => !memberIds.has(computer.id)),
      );
      return;
    }
    if (node.kind === 'computer') {
      setSelected(previous => mergeSelection(previous, [node], showDisabled));
      return;
    }
    try {
      const result = await resolveSubtree({
        sourceId,
        branchId: node.id,
        kind: node.kind,
        ...(showContainers ? {showContainers} : {}),
      });
      if (currentVersion === version.current) {
        if (graphRevision.current !== revision)
          throw new Error(
            'Directory results changed. Your selection has been preserved. Retry selection.',
          );
        setGraph(previous => mergeDirectoryGraph(previous, result.graph));
        setSelected(previous =>
          mergeSelection(previous, result.computers, showDisabled),
        );
      }
    } catch (error) {
      if (currentVersion === version.current) {
        setSelectionError(node);
        setResolutionError(error instanceof Error ? error.message : undefined);
      }
    } finally {
      if (currentVersion === version.current) resetResolution();
    }
  };

  // These maps are views of one graph, never independently retained state.
  const completeMemberships: Record<string, DirectoryComputer[]> = {};
  const knownMembers: Record<string, DirectoryComputer[]> = {};
  for (const id of Object.keys(currentGraph.branches)) {
    const members = getDirectoryMembers(currentGraph, id);
    knownMembers[id] = members.computers;
    if (members.complete) completeMemberships[id] = members.computers;
  }
  const redundantBranchSummaries = Object.entries(
    currentGraph.branches,
  ).flatMap(([id, snapshot]) => {
    const branchChildren = snapshot.children
      .map(childId => currentGraph.nodes[childId])
      .filter(
        (node): node is Exclude<DirectoryNode, DirectoryComputer> =>
          node !== undefined && node.kind !== 'computer',
      );
    if (branchChildren.length !== 1) return [];
    const parentMembers = knownMembers[id] ?? [];
    const childMembers = knownMembers[branchChildren[0].id] ?? [];
    if (parentMembers.length !== childMembers.length) return [];
    const childIds = new Set(childMembers.map(child => child.id));
    return parentMembers.every(parent => childIds.has(parent.id)) ? [id] : [];
  });
  const computerPaths = getDirectoryComputerPaths(currentGraph);
  const hosts = selectedHostnames(selected);
  const computers = knownMembers['directory-root'] ?? [];
  const isPartial = Object.values(currentGraph.branches).some(
    branch => !branch.complete,
  );
  const matchingKnown = computers.every(
    computer => computer.matchedTargets !== undefined,
  );
  const counts: DirectoryOverview['counts'] = {
    found: computers.length,
    disabled: computers.filter(computer => computer.disabled).length,
    captured: matchingKnown
      ? computers.filter(computer => (computer.matchedTargets?.length ?? 0) > 0)
          .length
      : undefined,
    available: matchingKnown
      ? computers.filter(
          computer =>
            (showDisabled || !computer.disabled) &&
            computer.matchedTargets?.length === 0,
        ).length
      : undefined,
  };

  return (
    <Column flex={1} gap="md" mih={0} miw={0}>
      {overview && (
        <DiscoverySummary
          counts={counts}
          isPartial={isPartial}
          showDisabled={showDisabled}
        />
      )}
      <DirectoryWorkspace flex={1} gap={0} mih={0}>
        <DirectoryToolbar
          aria-label={_('Directory controls')}
          flex="0 0 auto"
          gap="sm"
          justify="space-between"
          p="sm"
          role="group"
          wrap="wrap"
        >
          <DirectoryHeading>{_('Directory objects')}</DirectoryHeading>
          <Row align="center" flex="0 1 auto" gap="xs" miw={0} wrap="wrap">
            <Checkbox
              checked={showDisabled}
              title={_('Show disabled Active Directory objects')}
              onChange={value => {
                version.current += 1;
                setShowDisabled(value);
                setSelectionError(undefined);
                if (!value)
                  setSelected(previous =>
                    previous.filter(computer => !computer.disabled),
                  );
              }}
            />
            <Checkbox
              checked={showContainers}
              title={_('Show containers')}
              onChange={value => {
                version.current += 1;
                listingVersionRef.current += 1;
                setListingVersion(listingVersionRef.current);
                setShowContainers(value);
                setGraph({nodes: currentGraph.nodes, branches: {}});
                setSelectionError(undefined);
                setResolutionError(undefined);
                resetResolution();
              }}
            />
            <InfoTip ariaLabel={_('About Active Directory discovery')}>
              {_(
                'A disabled Active Directory account does not mean that the computer is offline or harmless. Only computers registered in Active Directory can be discovered.',
              )}
            </InfoTip>
          </Row>
        </DirectoryToolbar>
        <DirectoryScrollArea
          aria-label={_('Directory objects')}
          flex={1}
          gap="xs"
          pb="sm"
          pt="xxs"
          px="xxs"
          role="region"
        >
          {loadError ? (
            <ErrorPanel
              action={{
                label: _('Retry'),
                onClick: () => void reloadOverview(),
                isLoading: loading,
              }}
              details={
                overviewError instanceof Error
                  ? overviewError.message
                  : undefined
              }
              message={_('Could not load Active Directory.')}
            />
          ) : (
            loading && <Loading label={_('Loading Active Directory...')} />
          )}
          {overview?.truncated && (
            <Alert
              dismissible={false}
              role="status"
              title={_(
                'Directory root: some objects were not returned. You can select the loaded computers.',
              )}
              type={EStatus.WARNING}
            />
          )}
          {overview && (
            <DirectoryTree
              key={listingVersion}
              computerPaths={computerPaths}
              knownMembers={knownMembers}
              memberships={completeMemberships}
              nodes={overview.roots}
              redundantBranchSummaries={redundantBranchSummaries}
              selectedIds={selectedComputerIds}
              selectionPending={resolving}
              showContainers={showContainers}
              showDisabled={showDisabled}
              sourceId={sourceId}
              onLoaded={onLoaded}
              onSelect={(node, checked) => void select(node, checked)}
            />
          )}
        </DirectoryScrollArea>
        {selectionError && (
          <ErrorPanel
            action={{
              label: _('Retry selection'),
              onClick: () => void select(selectionError, true),
              isLoading: resolving,
            }}
            details={resolutionError}
            message={_(
              'Could not resolve the selected OU/group. Your selection has been preserved.',
            )}
          />
        )}
        <DirectoryFooter
          aria-label={_('Selected hosts')}
          flex="0 0 auto"
          gap="sm"
          justify="space-between"
          px="sm"
          py="xs"
          role="group"
          wrap="wrap"
        >
          <Row align="center" gap="xs" wrap="wrap">
            <span aria-live="polite">
              {_('{{count}} hosts selected', {count: hosts.length})}
            </span>
            <InfoTip ariaLabel={_('Selected hosts')}>
              {_('Computers already in scan targets can still be selected.')}
            </InfoTip>
          </Row>
          <Button
            aria-busy={resolving}
            disabled={
              resolving ||
              hosts.length === 0 ||
              !capabilities.mayCreate('target')
            }
            isLoading={resolving}
            styles={{
              inner: {height: 'auto'},
              label: {
                display: 'block',
                height: 'auto',
                lineHeight: 1.25,
                overflow: 'visible',
                whiteSpace: 'normal',
              },
            }}
            title={_('Add {{count}} hosts to new target', {
              count: hosts.length,
            })}
            onClick={() => onApply(hosts)}
          />
        </DirectoryFooter>
      </DirectoryWorkspace>
    </Column>
  );
};

export default DirectoryBrowser;
