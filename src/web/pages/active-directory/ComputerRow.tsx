/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {memo, type ReactNode} from 'react';
import styled from 'styled-components';
import {type DirectoryComputer} from 'gmp/models/active-directory';
import {isDefined} from 'gmp/utils/identity';
import Badge, {EThemeColors} from 'web/components/badge/StatusBadge';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import {
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

const ComputerDisclosure = styled(Row)`
  > button {
    min-width: 0;
    width: auto;
  }
`;

const ComputerRow = memo(function ComputerRow({
  node,
  depth = 0,
}: {
  node: DirectoryComputer;
  depth?: number;
}) {
  const [_] = useTranslation();
  const missingHostnameLabel = node.hostname ? undefined : _('No DNS hostname');
  const disclosure = <span>{node.name}</span>;
  const targets = node.matchedTargets;
  let targetSummary: ReactNode;
  if (!isDefined(targets)) {
    targetSummary = _('Matching information unavailable');
  } else if (targets.length === 0) {
    targetSummary = _('No matching readable scan targets');
  } else {
    targetSummary = (
      <span>
        <span>{targets[0].name}</span>
        {targets.length > 1 && (
          <> {_('+{{count}} more', {count: targets.length - 1})}</>
        )}
      </span>
    );
  }
  return (
    <li>
      <ComputerDirectoryRow $depth={depth}>
        <div>
          {isDefined(missingHostnameLabel) ? (
            <ComputerDisclosure gap="xs" wrap="wrap">
              {disclosure}
              <span
                title={_('This computer cannot be transferred to a target.')}
              >
                <HostnameBadge color={EThemeColors.Orange} size="sm">
                  {missingHostnameLabel}
                </HostnameBadge>
              </span>
            </ComputerDisclosure>
          ) : (
            disclosure
          )}
          {node.disabled && (
            <small>{_('Disabled Active Directory object')}</small>
          )}
        </div>
        <div>
          <ComputerMetadataLabel>{_('Operating system')}</ComputerMetadataLabel>
          {node.operatingSystem || _('Not provided')}
        </div>
        <div>
          <ComputerMetadataLabel>{_('Scan targets')}</ComputerMetadataLabel>
          {targetSummary}
        </div>
      </ComputerDirectoryRow>
    </li>
  );
});

export default ComputerRow;
