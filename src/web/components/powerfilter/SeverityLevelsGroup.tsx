/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {useCallback} from 'react';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import SeverityClassLabel from 'web/components/label/SeverityClass';
import IconDivider from 'web/components/layout/IconDivider';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

interface SeverityLevelsFilterGroupProps {
  filter: Filter;
  onChange: (value: string, field: string) => void;
  onRemove: () => void;
}

const SeverityLevelsFilterGroup = ({
  filter,
  onChange,
  onRemove,
}: SeverityLevelsFilterGroupProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();

  const handleLevelChange = useCallback(
    (value: string, level: string) => {
      let levels = filter.get('levels') as string;

      if (!isDefined(levels)) {
        levels = '';
      }

      if (value && !levels.includes(level)) {
        levels += level;
        onChange(levels, 'levels');
      } else if (!value && levels.includes(level)) {
        levels = levels.replace(level, '');

        if (levels.trim().length === 0) {
          onRemove();
        } else {
          onChange(levels, 'levels');
        }
      }
    },
    [filter, onChange, onRemove],
  );

  let levels = filter.get('levels') as string;

  if (!isDefined(levels)) {
    levels = '';
  }

  const useCritical = gmp.settings.severityRating === SEVERITY_RATING_CVSS_3;
  return (
    <FormGroup
      data-testid="severity-levels-filter-group"
      title={_('Severity (Class)')}
    >
      <IconDivider>
        {useCritical && (
          <>
            {/* @ts-expect-error */}
            <Checkbox
              checked={levels.includes('c')}
              data-testid="severity-filter-critical"
              name="c"
              onChange={handleLevelChange}
            />
            <SeverityClassLabel.Critical />
          </>
        )}
        {/* @ts-expect-error */}
        <Checkbox
          checked={levels.includes('h')}
          data-testid="severity-filter-high"
          name="h"
          onChange={handleLevelChange}
        />
        <SeverityClassLabel.High />
        {/* @ts-expect-error */}
        <Checkbox
          checked={levels.includes('m')}
          data-testid="severity-filter-medium"
          name="m"
          onChange={handleLevelChange}
        />
        <SeverityClassLabel.Medium />
        {/* @ts-expect-error */}
        <Checkbox
          checked={levels.includes('l')}
          data-testid="severity-filter-low"
          name="l"
          onChange={handleLevelChange}
        />
        <SeverityClassLabel.Low />
        {/* @ts-expect-error */}
        <Checkbox
          checked={levels.includes('g')}
          data-testid="severity-filter-log"
          name="g"
          onChange={handleLevelChange}
        />
        <SeverityClassLabel.Log />
        {/* @ts-expect-error */}
        <Checkbox
          checked={levels.includes('f')}
          data-testid="severity-filter-false-positive"
          name="f"
          onChange={handleLevelChange}
        />
        <SeverityClassLabel.FalsePositive />
      </IconDivider>
    </FormGroup>
  );
};

export default SeverityLevelsFilterGroup;
