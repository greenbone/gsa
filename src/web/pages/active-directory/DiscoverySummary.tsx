/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {type DirectoryOverview} from 'gmp/models/active-directory';
import Badge, {EThemeColors} from 'web/components/badge/StatusBadge';
import HighlightBox from 'web/components/highlight-box';
import {
  AlertCircleIcon,
  CheckIcon,
  CircleOffIcon,
  DatabaseIcon,
  SearchIcon,
} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';

type SummaryColor = 'blue' | 'yellow' | 'gray' | 'violet' | 'green';

interface DiscoverySummaryProps {
  counts: DirectoryOverview['counts'];
  showDisabled: boolean;
  isPartial?: boolean;
  rootTruncated?: boolean;
}

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  flex-shrink: 0;
  gap: var(--mantine-spacing-xs);

  @container ad-discovery (max-width: 43rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @container ad-discovery (max-width: 17rem) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const SummaryCard = styled.div<{$color: SummaryColor}>`
  > div {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: var(--mantine-spacing-xs);
    height: 100%;
    box-sizing: border-box;
    background-color: ${({$color}) =>
      `color-mix(in srgb, var(--mantine-color-${$color}-light) 60%, var(--mantine-color-default))`};
    border: 1px solid var(--mantine-color-default-border);
    padding: var(--mantine-spacing-xs) var(--mantine-spacing-sm);
  }

  dl {
    display: grid;
    grid-template-rows: 1fr auto;
    align-self: stretch;
    gap: var(--mantine-spacing-xxs);
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  dt {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--mantine-spacing-xxs);
    font-size: var(--mantine-font-size-sm);
    line-height: var(--mantine-line-height-sm);
  }

  dd {
    margin: 0;
    font-size: var(--mantine-font-size-xl);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    line-height: var(--mantine-h3-line-height);
    min-block-size: var(--mantine-h3-line-height);
  }

  dd[data-unavailable] {
    font-size: var(--mantine-font-size-sm);
    font-weight: 600;
  }

  @container ad-discovery (max-width: 17rem) {
    > div {
      padding-inline: var(--mantine-spacing-xs);
    }
  }
`;

const MetricIconTile = styled.span<{$color: SummaryColor}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mantine-spacing-lg);
  height: var(--mantine-spacing-lg);
  border-radius: 50%;
  background-color: var(--mantine-color-default);
  color: ${({$color}) => `var(--mantine-color-${$color}-light-color)`};
`;

const DiscoverySummary = ({
  counts,
  showDisabled,
  isPartial = false,
  rootTruncated = false,
}: DiscoverySummaryProps) => {
  const [_] = useTranslation();
  const countsHelp = _(
    'Counts describe distinct computers in currently loaded results. Results may be partial and indicators can overlap. Target matches reflect readable scan targets. Unavailable information is not counted as zero.',
  );
  const partialDetails = rootTruncated
    ? _(
        'Directory root: some objects were not returned. You can select the loaded computers.',
      )
    : countsHelp;
  const metrics = [
    {
      id: 'found',
      label: _('Loaded computers'),
      count: counts.found,
      color: 'blue',
      icon: SearchIcon,
    },
    {
      id: 'unresolvable',
      label: _('Unresolvable'),
      count: counts.unresolvable,
      color: 'yellow',
      icon: AlertCircleIcon,
    },
    {
      id: 'disabled',
      label: _('Hidden (disabled)'),
      count: showDisabled ? 0 : counts.disabled,
      color: 'gray',
      icon: CircleOffIcon,
    },
    {
      id: 'captured',
      label: _('Already captured'),
      count: counts.captured,
      color: 'violet',
      icon: DatabaseIcon,
    },
    {
      id: 'available',
      label: _('Available'),
      count: counts.available,
      color: 'green',
      icon: CheckIcon,
    },
  ] as const;
  return (
    <Summary
      aria-atomic="true"
      aria-label={_('Discovery summary')}
      aria-live="polite"
      role="group"
    >
      {metrics.map(({id, label, count, color, icon: MetricIcon}) => (
        <SummaryCard key={id} $color={color} data-metric={id}>
          <HighlightBox>
            <MetricIconTile $color={color} aria-hidden="true">
              <MetricIcon forceStatic color="currentColor" size="small" />
            </MetricIconTile>
            <dl>
              <dt>
                <span
                  title={id === 'found' && !isPartial ? countsHelp : undefined}
                >
                  {label}
                </span>
                {id === 'found' && isPartial && (
                  <output aria-label={_('Partial')} title={partialDetails}>
                    <Badge color={EThemeColors.Orange} size="sm">
                      {_('Partial')}
                    </Badge>
                  </output>
                )}
              </dt>
              <dd data-unavailable={count === undefined ? '' : undefined}>
                {count ?? _('Unavailable')}
              </dd>
            </dl>
          </HighlightBox>
        </SummaryCard>
      ))}
    </Summary>
  );
};

export default DiscoverySummary;
