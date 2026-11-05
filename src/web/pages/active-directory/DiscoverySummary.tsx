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
import InfoTip from 'web/components/info-tip/InfoTip';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';

type SummaryColor = 'blue' | 'yellow' | 'gray' | 'violet' | 'green';

interface DiscoverySummaryProps {
  counts: DirectoryOverview['counts'];
  showDisabled: boolean;
  isPartial?: boolean;
}

const SummaryCard = styled.div<{$color: SummaryColor}>`
  flex: 1 1 9rem;
  min-width: 0;

  &[data-metric='found'] {
    flex-grow: 1.25;

    dt {
      font-weight: 600;
    }
    dd {
      font-size: calc(var(--mantine-font-size-xl) * 1.3);
    }
  }

  &[data-metric='unresolvable'] dd {
    color: var(--mantine-color-yellow-9);
  }

  > div {
    display: flex;
    align-items: center;
    gap: var(--mantine-spacing-sm);
    height: 100%;
    box-sizing: border-box;
    background-color: ${({$color}) => `var(--mantine-color-${$color}-light)`};
    box-shadow: var(--mantine-shadow-xs);
    color: var(--mantine-color-text);
    padding: var(--mantine-spacing-xs) var(--mantine-spacing-sm);
  }

  dl {
    display: flex;
    flex-direction: column;
    gap: var(--mantine-spacing-xxs);
    margin: 0;
    min-width: 0;
  }

  dt {
    display: flex;
    align-items: center;
    gap: var(--mantine-spacing-xs);
    font-size: var(--mantine-font-size-md);
    line-height: 1.25;
  }

  dd {
    margin: 0;
    font-size: calc(var(--mantine-font-size-xl) * 1.15);
    font-weight: 700;
    line-height: 1.2;
  }
`;

const MetricIconTile = styled.span<{$color: SummaryColor}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 2rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--mantine-color-default);
  color: ${({$color}) => `var(--mantine-color-${$color}-light-color)`};
`;

const DiscoverySummary = ({
  counts,
  showDisabled,
  isPartial = false,
}: DiscoverySummaryProps) => {
  const [_] = useTranslation();
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
    <Layout
      flex
      wrap
      aria-atomic="true"
      aria-label={_('Discovery summary')}
      aria-live="polite"
      role="group"
      style={{gap: 'var(--mantine-spacing-sm)', flexShrink: 0}}
    >
      {metrics.map(({id, label, count, color, icon: MetricIcon}) => (
        <SummaryCard key={id} $color={color} data-metric={id}>
          <HighlightBox>
            <MetricIconTile $color={color} aria-hidden="true">
              <MetricIcon forceStatic color="currentColor" size="small" />
            </MetricIconTile>
            <dl>
              <dt>
                {label}
                {id === 'found' && (
                  <>
                    {isPartial && (
                      <Badge color={EThemeColors.Orange} size="sm">
                        {_('Partial')}
                      </Badge>
                    )}
                    <InfoTip ariaLabel={_('About discovery counts')}>
                      {_(
                        'Counts describe distinct computers in currently loaded results. Results may be partial and indicators can overlap. Target matches reflect readable scan targets. Unavailable information is not counted as zero.',
                      )}
                    </InfoTip>
                  </>
                )}
              </dt>
              <dd>{count ?? _('Unavailable')}</dd>
            </dl>
          </HighlightBox>
        </SummaryCard>
      ))}
    </Layout>
  );
};

export default DiscoverySummary;
