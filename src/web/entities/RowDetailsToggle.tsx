/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ButtonHTMLAttributes} from 'react';
import {ChevronDown} from 'lucide-react';
import styled from 'styled-components';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

interface RowDetailsToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'value' | 'children'
> {
  'data-testid'?: string;
  detailsExpanded?: boolean;
  detailsId?: string;
  previewLabel?: string;
  onClick?: () => void;
}

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 2px;
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  @media print {
    color: ${Theme.black};
  }
`;

const StyledChevron = styled(ChevronDown)<{$expanded: boolean}>`
  transform: ${({$expanded}) => ($expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 200ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const RowDetailsToggle = ({
  'data-testid': dataTestId = 'row-details-toggle',
  detailsExpanded = false,
  detailsId,
  previewLabel,
  onClick,
  ...props
}: RowDetailsToggleProps) => {
  const [_] = useTranslation();
  let label: string;
  if (detailsExpanded) {
    label = previewLabel
      ? _('Hide preview for {{- name}}', {name: previewLabel})
      : _('Hide preview');
  } else {
    label = previewLabel
      ? _('Show preview for {{- name}}', {name: previewLabel})
      : _('Show preview');
  }
  return (
    <StyledButton
      {...props}
      aria-controls={detailsId}
      aria-expanded={detailsExpanded}
      aria-label={label}
      data-testid={dataTestId}
      title={label}
      type="button"
      onClick={() => onClick?.()}
    >
      <StyledChevron $expanded={detailsExpanded} aria-hidden="true" size={20} />
    </StyledButton>
  );
};

export default RowDetailsToggle;
