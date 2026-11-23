/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  const graphRevision = useRef(0);
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
  const selected = [...selectedPaths.keys()].flatMap(id => {
    const node = currentGraph.nodes[id];
    return node?.kind === 'computer' ? [node] : [];
  });
  const selectedComputerIds = new Set(selected.map(computer => computer.id));
  const setSelected = (
    update: (previous: DirectoryComputer[]) => DirectoryComputer[],
    path: readonly string[] = [],
  ) => {
    setSelectedPaths(
      previous =>
        new Map(
          update(
            [...previous.keys()].flatMap(id => {
              const node = currentGraph.nodes[id];
              return node?.kind === 'computer' ? [node] : [];
            }),
          ).map(({id}) => [id, previous.get(id) ?? path]),
        ),
    );
  };
  const [showDisabled, setShowDisabled] = useState(false);
  const [selectionError, setSelectionError] = useState<{
    node: DirectoryNode;
    error?: Error;
  }>();
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

  const summary = useMemo(
    () => summarizeDirectory(currentGraph),
    [currentGraph],
  );
  const {
    availableIncludingDisabled,
    completeMemberships,
    computerPaths,
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
    const revision = graphRevision.current;
    setSelectionError(undefined);
    if (!checked) {
      const memberIds =
        node.kind === 'computer'
          ? new Set([node.id])
          : (selectedIncompleteMembers.get(node.id) ??
            new Set(completeMemberships[node.id]?.map(member => member.id)));
      setSelected(previous =>
        previous.filter(computer => !memberIds.has(computer.id)),
      );
      return;
    }
    if (node.kind === 'computer') {
      setSelected(
        previous => mergeSelection(previous, [node], showDisabled),
        path,
      );
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
        setSelectionError({
          node,
          error: error instanceof Error ? error : undefined,
        });
      }
    } finally {
      if (currentVersion === version.current) resetResolution();
    }
  };

  const hosts = selectedHostnames(selected);
  let selectionFeedback;
  if (selectionError?.error instanceof IncompleteDirectoryResultsError) {
    selectionFeedback = (
      <Alert
        dismissible={false}
        role="status"
        title={_(
          'Could not select all computers in {{name}}. Select the loaded computers individually.',
          {name: selectionError.node.name},
        )}
        type={EStatus.WARNING}
      />
    );
  } else if (selectionError) {
    selectionFeedback = (
      <ErrorPanel
        action={{
          label: _('Retry selection'),
          onClick: () => void select(selectionError.node, true),
          isLoading: resolving,
        }}
        details={selectionError.error?.message}
        message={_(
          'Could not resolve the selected OU/group. Your selection has been preserved.',
        )}
      />
    );
  }

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
              memberships={completeMemberships}
              nodes={overview.roots}
              redundantBranchSummaries={redundantBranchSummaries}
              selectedIds={selectedComputerIds}
              selectedIncompleteMembers={selectedIncompleteMembers}
              selectionPending={resolving}
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
        {selectionFeedback}
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
