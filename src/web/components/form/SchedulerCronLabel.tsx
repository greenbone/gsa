/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

const Label = styled.div`
  margin-bottom: 2px;
  color: ${Theme.mediumGray};
  font-size: var(--mantine-font-size-xs);
  font-weight: 500;
`;

interface SchedulerCronLabelProps {
  number: number;
}

const SchedulerCronLabel = ({number}: SchedulerCronLabelProps) => {
  const [_] = useTranslation();

  return <Label>{_('Schedule {{number}}', {number})}</Label>;
};

export default SchedulerCronLabel;
