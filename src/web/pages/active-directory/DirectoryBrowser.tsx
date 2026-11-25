/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  type DirectoryComputer,
  type DirectoryNode,
  type DirectoryOverview,
} from 'gmp/models/active-directory';
import {
  emptyDirectoryGraph,
  beginDirectorySnapshot,
  getDirectoryComputerPaths,
  replaceDirectorySnapshot,
  mergeDirectoryGraph,
} from 'gmp/models/directory-graph';
import {IncompleteDirectoryResultsError} from 'gmp/models/directory-resolution';
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
  getSelectedMembersOfIncompleteBranches,
  getResolvedBranchesByComputer,
  mergeSelection,
  selectedHostnames,
} from 'web/pages/active-directory/directory-selection';
import {summarizeDirectory} from 'web/pages/active-directory/directory-summary';
import {
  DirectoryFooter,
  DirectoryHeading,
  DirectoryScrollArea,
  DirectoryToolbar,
  DirectoryWorkspace,
} from 'web/pages/active-directory/DirectoryLayout';
import DirectoryTree from 'web/pages/active-directory/DirectoryTree';
import DiscoverySummary from 'web/pages/active-directory/DiscoverySummary';
import useDirectoryStickyHeader from 'web/pages/active-directory/useDirectoryStickyHeader';

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
  const directoryScrollAreaRef = useDirectoryStickyHeader(listingVersion);
  const listingVersionRef = useRef(0);
  const {
    data: overview,
    error: overviewError,
    isFetching: loading,
    isError: loadError,
    refetch: reloadOverview,
  } = useGetActiveDirectoryOverview(sourceId, showContainers, listingVersion);
  const [graph, setGraph] = useState(emptyDirectoryGraph);
  // Closed listings remain in the membership graph but cannot own a visible row.
  const [expandedListings, setExpandedListings] = useState(
    () => new Map<string, DirectoryNode[]>(),
  );
  const registerVisibleListing = useCallback(
    (pathKey: string, nodes: DirectoryNode[]) => {
      setExpandedListings(previous => new Map(previous).set(pathKey, nodes));
      return () => {
        setExpandedListings(previous => {
          if (previous.get(pathKey) !== nodes) return previous;
          const remaining = new Map(previous);
          remaining.delete(pathKey);
          return remaining;
        });
      };
    },
    [],
  );
  const listingRevisions = useRef(new Map<string, number>());
  const currentGraph = useMemo(
    () =>
      overview
        ? replaceDirectorySnapshot(
            graph,
            'directory-root',
            'overview',
            overview.roots,
            !overview.truncated,
          )
        : graph,
    [graph, overview],
  );
  const [selectedPaths, setSelectedPaths] = useState(
    () => new Map<string, readonly string[]>(),
  );
  const [showDisabled, setShowDisabled] = useState(false);
  if (!showDisabled) {
    const remaining = [...selectedPaths].filter(([id]) => {
      const node = currentGraph.nodes[id];
      return node?.kind !== 'computer' || !node.disabled;
    });
    if (remaining.length !== selectedPaths.size) {
      setSelectedPaths(new Map(remaining));
    }
  }
  const selected = [...selectedPaths.keys()].flatMap(id => {
    const node = currentGraph.nodes[id];
    return node?.kind === 'computer' && (showDisabled || !node.disabled)
      ? [node]
      : [];
  });
  const selectedComputerIds = new Set(selected.map(computer => computer.id));
  const computerPaths = useMemo(
    () =>
      getDirectoryComputerPaths(
        overview?.roots ?? [],
        expandedListings,
        showDisabled,
      ),
    [overview, expandedListings, showDisabled],
  );
  const addSelected = (
    computers: DirectoryComputer[],
    path: string[],
    resolvedBranches?: ReadonlyMap<string, string[]>,
  ) => {
    const eligible = mergeSelection([], computers, showDisabled);
    setSelectedPaths(previous => {
      const next = new Map(previous);
      for (const {id} of eligible) {
        const branches = [
          ...(previous.get(id) ?? []),
          ...path,
          ...(resolvedBranches?.get(id) ?? []),
        ];
        next.set(id, [...new Set(branches)]);
      }
      return next;
    });
  };
  const removeSelected = (shouldRemove: (id: string) => boolean) => {
    setSelectedPaths(
      previous => new Map([...previous].filter(([id]) => !shouldRemove(id))),
    );
  };
  const [selectionError, setSelectionError] = useState<{
    node: DirectoryNode;
    error?: Error;
    path?: string[];
  }>();
  const onLoaded = useCallback(
    (owner: string, branchId: string, listing?: DirectoryOverview) => {
      if (listingVersion !== listingVersionRef.current) return;
      const revisions = listingRevisions.current;
      for (const id of [
        branchId,
        ...(listing?.roots.map(node => node.id) ?? []),
      ]) {
        revisions.set(id, (revisions.get(id) ?? 0) + 1);
      }
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

  const summary = useMemo(
    () => summarizeDirectory(currentGraph),
    [currentGraph],
  );
  const {
    availableIncludingDisabled,
    completeMemberships,
    counts,
    isPartial,
    redundantBranchSummaries,
  } = summary;
  const selectedIncompleteMembers = useMemo(
    () =>
      getSelectedMembersOfIncompleteBranches(
        selectedPaths,
        summary.knownMembers,
        summary.completeMemberships,
      ),
    [selectedPaths, summary],
  );

  const select = async (
    node: DirectoryNode,
    checked: boolean,
    path?: string[],
  ) => {
    const currentVersion = ++version.current;
    setSelectionError(undefined);
    if (!checked) {
      const memberIds =
        node.kind === 'computer'
          ? new Set([node.id])
          : (selectedIncompleteMembers.get(node.id) ??
            new Set(completeMemberships[node.id]?.map(member => member.id)));
      removeSelected(id => memberIds.has(id));
      return;
    }
    if (node.kind === 'computer') {
      addSelected([node], path ?? []);
      return;
    }
    const branchPath = [...(path ?? []), node.id];
    const revisions = new Map(listingRevisions.current);
    try {
      const result = await resolveSubtree({
        sourceId,
        branchId: node.id,
        kind: node.kind,
        ...(showContainers ? {showContainers} : {}),
      });
      if (currentVersion === version.current) {
        const affectedIds = [
          ...branchPath,
          ...Object.keys(result.graph.branches),
          ...Object.keys(result.graph.nodes),
        ];
        if (
          affectedIds.some(
            id => listingRevisions.current.get(id) !== revisions.get(id),
          )
        )
          throw new Error(
            'Directory results changed. Your selection has been preserved. Retry selection.',
          );
        setGraph(previous => mergeDirectoryGraph(previous, result.graph));
        addSelected(
          result.computers,
          branchPath,
          getResolvedBranchesByComputer(result.graph),
        );
      }
    } catch (error) {
      if (currentVersion === version.current) {
        setSelectionError({
          node,
          error: error instanceof Error ? error : undefined,
          path,
        });
      }
    } finally {
      if (currentVersion === version.current) resetResolution();
    }
  };

  const hosts = selectedHostnames(selected);
  const incompleteSelection =
    selectionError?.error instanceof IncompleteDirectoryResultsError;
  const selectableLoaded = incompleteSelection
    ? mergeSelection(
        [],
        summary.knownMembers[selectionError.node.id] ?? [],
        showDisabled,
      )
    : [];
  const unselectedLoaded = selectableLoaded.filter(
    computer => !selectedComputerIds.has(computer.id),
  );
  const selectionWarning = incompleteSelection
    ? {
        id: selectionError.node.id,
        path: selectionError.path,
        count: unselectedLoaded.length,
        hasSelectableComputers: selectableLoaded.length > 0,
        onSelectLoaded: () => {
          version.current += 1;
          setSelectionError(undefined);
          addSelected(unselectedLoaded, [
            ...(selectionError.path ?? []),
            selectionError.node.id,
          ]);
        },
      }
    : undefined;

  return (
    <Column flex={1} gap="md" mih={0} miw={0}>
      {overview && (
        <DiscoverySummary
          counts={
            showDisabled
              ? {...counts, available: availableIncludingDisabled}
              : counts
          }
          isPartial={isPartial}
          rootTruncated={overview.truncated}
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
          ref={directoryScrollAreaRef}
          aria-label={_('Directory objects')}
          data-directory-scroll-area=""
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
          {overview && (
            <DirectoryTree
              key={listingVersion}
              computerPaths={computerPaths}
              memberships={completeMemberships}
              nodes={overview.roots}
              redundantBranchSummaries={redundantBranchSummaries}
              registerVisibleListing={registerVisibleListing}
              selectedIds={selectedComputerIds}
              selectedIncompleteMembers={selectedIncompleteMembers}
              selectionPending={resolving}
              selectionWarning={selectionWarning}
              showContainers={showContainers}
              showDisabled={showDisabled}
              sourceId={sourceId}
              onLoaded={onLoaded}
              onSelect={(node, checked, path) =>
                void select(node, checked, path)
              }
            />
          )}
        </DirectoryScrollArea>
        {selectionError && !incompleteSelection && (
          <ErrorPanel
            action={{
              label: _('Retry selection'),
              onClick: () =>
                void select(selectionError.node, true, selectionError.path),
              isLoading: resolving,
            }}
            details={selectionError.error?.message}
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
          <Row gap="xs" wrap="wrap">
            <span aria-live="polite">
              {_('{{count}} hosts selected', {count: hosts.length})}
            </span>
            <InfoTip ariaLabel={_('Selecting hosts already in scan targets')}>
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
            title={_('Add hosts to new target')}
            onClick={() => onApply(hosts)}
          />
        </DirectoryFooter>
      </DirectoryWorkspace>
    </Column>
  );
};

export default DirectoryBrowser;
