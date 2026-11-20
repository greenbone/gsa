/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, useState} from 'react';
import {Accordion} from '@mantine/core';
import {Tooltip} from '@greenbone/ui-lib';
import styled from 'styled-components';
import {type DirectoryComputer} from 'gmp/models/active-directory';
import Badge, {EThemeColors} from 'web/components/badge/StatusBadge';
import HighlightBox from 'web/components/highlight-box';
import Row from 'web/components/layout/Row';
import InlineNotification from 'web/components/notification/InlineNotification';
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

const HostnameTooltipTarget = styled.span`
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
  border-radius: var(--mantine-radius-xl);

  &:focus-visible {
    outline: 2px solid var(--mantine-color-anchor);
    outline-offset: 2px;
  }
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
      <InlineNotification
        action={{
          label: _('Retry'),
          onClick: () => void refetch(),
          isLoading: retrying,
        }}
        message={_('Could not load computer details.')}
        severity="error"
      />
    );
  }

  return (
    <ComputerDetails
      details={data}
      feedback={feedback}
      loading={isFetching && !retrying}
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
  onSelect,
}: {
  node: DirectoryComputer;
  sourceId: string;
  checked: boolean;
  selectionPending: boolean;
  depth?: number;
  onSelect: (checked: boolean) => void;
}) => {
  const [_] = useTranslation();
  const [expanded, setExpanded] = useState(false);
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
    <li>
      <DirectoryAccordion
        value={expanded ? 'details' : null}
        onChange={value => setExpanded(value !== null)}
      >
        <Accordion.Item value="details">
          <ComputerDirectoryRow $depth={depth}>
            <div>
              {node.hostname ? (
                disclosure
              ) : (
                <ComputerDisclosure gap="xs" wrap="wrap">
                  {disclosure}
                  <Tooltip
                    multiline
                    events={{hover: true, focus: true, touch: true}}
                    label={_(
                      'This computer cannot be transferred to a target.',
                    )}
                    styles={{tooltip: {maxWidth: 'calc(100vw - 1rem)'}}}
                    width={260}
                  >
                    <HostnameTooltipTarget tabIndex={0}>
                      <HostnameBadge color={EThemeColors.Orange} size="sm">
                        {_('No DNS hostname')}
                      </HostnameBadge>
                    </HostnameTooltipTarget>
                  </Tooltip>
                </ComputerDisclosure>
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
            <div>
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
