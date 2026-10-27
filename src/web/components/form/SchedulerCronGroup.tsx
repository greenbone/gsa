/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import styled from 'styled-components';
import FormGroup from 'web/components/form/FormGroup';
import InfoTip from 'web/components/info-tip/InfoTip';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

const Description = styled.p`
  margin: 0;
  color: ${Theme.mediumGray};
  font-size: var(--mantine-font-size-xs);
`;

interface SchedulerCronGroupProps {
  children: ReactNode;
  title?: ReactNode;
  infoTip?: ReactNode;
  infoTipAriaLabel?: string;
}

const SchedulerCronGroup = ({
  children,
  title,
  infoTip,
  infoTipAriaLabel,
}: SchedulerCronGroupProps) => {
  const [_] = useTranslation();

  return (
    <FormGroup
      gap="xs"
      title={
        <>
          {title || _('Scheduler Options')}
          {infoTip && (
            <InfoTip ariaLabel={infoTipAriaLabel ?? _('More information')}>
              {infoTip}
            </InfoTip>
          )}
        </>
      }
    >
      <Description>
        {_(
          "Choose from the dropdown of common schedules, or select 'Custom cron expression' in the list to enter your own cron schedule.",
        )}
      </Description>
      {children}
    </FormGroup>
  );
};

export default SchedulerCronGroup;
