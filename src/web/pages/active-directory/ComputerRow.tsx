/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, useState} from 'react';
import {Accordion} from '@mantine/core';
import {type DirectoryComputer} from 'gmp/models/active-directory';
import HighlightBox from 'web/components/highlight-box';
import Loading from 'web/components/loading/Loading';
import InlineNotification from 'web/components/notification/InlineNotification';
import EntitySelection from 'web/entities/EntitySelection';
import {useGetActiveDirectoryComputerDetails} from 'web/hooks/use-query/active-directory';
import useTranslation from 'web/hooks/useTranslation';
import ComputerDetails from 'web/pages/active-directory/ComputerDetails';
import DirectoryAccordion from 'web/pages/active-directory/DirectoryAccordion';
import {
  ComputerDetailsInset,
  DirectoryRow,
} from 'web/pages/active-directory/DirectoryLayout';

const ExpandedComputerDetails = ({
  node,
  sourceId,
}: {
  node: DirectoryComputer;
  sourceId: string;
}) => {
  const [_] = useTranslation();
  const {data, isError, isFetching, refetch} =
    useGetActiveDirectoryComputerDetails(sourceId, node.id);

  return (
    <ComputerDetails
      details={data}
      feedback={
        <>
          {isFetching && (
            <output aria-label={_('Loading computer details...')}>
              <Loading />
            </output>
          )}
          {isError && (
            <InlineNotification
              action={{
                label: _('Retry'),
                onClick: () => void refetch(),
                isLoading: isFetching,
              }}
              message={_('Could not load computer details.')}
              severity="error"
            />
          )}
        </>
      }
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
          <DirectoryRow $depth={depth}>
            <div>
              <Accordion.Control
                aria-label={_('Computer details for {{name}}', {
                  name: node.name,
                })}
                title={
                  expanded
                    ? _('Hide computer details')
                    : _('Show computer details')
                }
              >
                {node.name}
              </Accordion.Control>
              {node.disabled && (
                <small>{_('Disabled Active Directory object')}</small>
              )}
              {!node.hostname && (
                <small>
                  {_(
                    'No DNS hostname available. This computer cannot be transferred to a target.',
                  )}
                </small>
              )}
            </div>
            <div>{node.operatingSystem || _('Not provided')}</div>
            <div>{targetSummary}</div>
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
          </DirectoryRow>
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
