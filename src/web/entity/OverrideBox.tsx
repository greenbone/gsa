/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import type Override from 'gmp/models/override';
import {isDefined} from 'gmp/utils/identity';
import {DetailsIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import EntityBox from 'web/entity/EntityBox';
import useTranslation from 'web/hooks/useTranslation';
import {
  LOG_VALUE,
  translatedResultSeverityRiskFactor,
} from 'web/utils/severity';

interface OverrideBoxProps {
  override: Override;
  detailsLink?: boolean;
  'data-testid'?: string;
}

const OverrideBox = ({
  override,
  detailsLink = true,
  'data-testid': dataTestId = 'override-box',
}: OverrideBoxProps) => {
  const [_] = useTranslation();
  let severity;
  let newSeverity = '';
  if (!isDefined(override.severity)) {
    severity = _('Any');
  } else if (override.severity > LOG_VALUE) {
    severity = _('Severity > 0.0');
  } else {
    severity = translatedResultSeverityRiskFactor(override.severity);
  }

  if ((override.newSeverity as number) > LOG_VALUE) {
    newSeverity = override.newSeverity + ': ';
  }
  newSeverity += translatedResultSeverityRiskFactor(
    override.newSeverity as number,
  );

  const toolbox = detailsLink ? (
    <IconDivider>
      <DetailsLink
        id={override.id as string}
        title={_('Override Details')}
        type="override"
      >
        <DetailsIcon />
      </DetailsLink>
    </IconDivider>
  ) : undefined;
  return (
    <EntityBox
      data-testid={dataTestId}
      end={override.endTime}
      modified={override.modificationTime}
      text={override.text}
      title={_('Override from {{- severity}} to {{- newSeverity}}', {
        severity,
        newSeverity,
      })}
      toolbox={toolbox}
    />
  );
};

export default OverrideBox;
