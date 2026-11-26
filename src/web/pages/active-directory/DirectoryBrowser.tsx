/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useMemo, useRef, useState} from 'react';
import {
  type DirectoryNode,
  type DirectoryOverview,
} from 'gmp/models/active-directory';
import {
  emptyDirectoryGraph,
  beginDirectorySnapshot,
  getDirectoryComputerPaths,
  replaceDirectorySnapshot,
} from 'gmp/models/directory-graph';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Checkbox from 'web/components/form/Checkbox';
import InfoTip from 'web/components/info-tip/InfoTip';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import Loading from 'web/components/loading/Loading';
import {useGetActiveDirectoryOverview} from 'web/hooks/use-query/active-directory';
import useTranslation from 'web/hooks/useTranslation';
import {summarizeDirectory} from 'web/pages/active-directory/directory-summary';
import {
  DirectoryHeading,
  DirectoryScrollArea,
  DirectoryToolbar,
  DirectoryWorkspace,
} from 'web/pages/active-directory/DirectoryLayout';
import DirectoryTree from 'web/pages/active-directory/DirectoryTree';
import DiscoverySummary from 'web/pages/active-directory/DiscoverySummary';

interface DirectoryBrowserProps {
  sourceId: string;
}

export const DirectoryBrowser = ({sourceId}: DirectoryBrowserProps) => {
  const [_] = useTranslation();
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
  const [showDisabled, setShowDisabled] = useState(false);
  const computerPaths = useMemo(
    () =>
      getDirectoryComputerPaths(
        overview?.roots ?? [],
        expandedListings,
        showDisabled,
      ),
    [overview, expandedListings, showDisabled],
  );
  const onLoaded = useCallback(
    (owner: string, branchId: string, listing?: DirectoryOverview) => {
      if (listingVersion !== listingVersionRef.current) return;
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
  const summary = useMemo(
    () => summarizeDirectory(currentGraph),
    [currentGraph],
  );
  const {availableIncludingDisabled, counts, isPartial} = summary;
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
                setShowDisabled(value);
              }}
            />
            <Checkbox
              checked={showContainers}
              title={_('Show containers')}
              onChange={value => {
                listingVersionRef.current += 1;
                setListingVersion(listingVersionRef.current);
                setShowContainers(value);
                setGraph({nodes: currentGraph.nodes, branches: {}});
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
              nodes={overview.roots}
              registerVisibleListing={registerVisibleListing}
              showContainers={showContainers}
              showDisabled={showDisabled}
              sourceId={sourceId}
              onLoaded={onLoaded}
            />
          )}
        </DirectoryScrollArea>
      </DirectoryWorkspace>
    </Column>
  );
};

export default DirectoryBrowser;
