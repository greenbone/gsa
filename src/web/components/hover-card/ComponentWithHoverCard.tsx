/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, type ReactElement, cloneElement} from 'react';
import HoverCard from 'web/components/hover-card/HoverCard';
import useTranslation from 'web/hooks/useTranslation';

interface ComponentWithHoverCardProps {
  /** The component (TextField, NumberField, etc.) */
  slot: ReactElement;
  /** The help content to display in the hover card */
  helpContent: ReactNode;
  /** Aria label for the help button */
  helpAriaLabel?: string;
  /** Data test ID for the hover card */
  dataTestId?: string;
}

/**
 * Wrapper component that adds a HoverCard to a component
 * Shows on hover like a traditional tooltip
 *
 * @example
 * <ComponentWithHoverCard
 *   slot={<TextField name="cron" value={value} onChange={onChange} />}
 *   helpContent="Enter a custom cron expression..."
 *   helpAriaLabel="More info about cron format"
 * />
 *
 * @example
 * <ComponentWithHoverCard
 *   slot={<FormGroup title={_('Schedule')} direction="row">...</FormGroup>}
 *   helpContent="Schedule help text"
 *   helpAriaLabel="More info about schedules"
 * />
 */
const ComponentWithHoverCard = ({
  slot,
  helpContent,
  helpAriaLabel,
  dataTestId,
}: ComponentWithHoverCardProps) => {
  const [_] = useTranslation();
  const ariaLabel = helpAriaLabel || _('More info');

  const hoverCardElement = (
    <HoverCard ariaLabel={ariaLabel} dataTestId={dataTestId}>
      {helpContent}
    </HoverCard>
  );

  // Clone the slot element and add the HoverCard to its title
  const slotWithHoverCard = cloneElement(slot, {
    ...slot.props,
    title: slot.props.title ? (
      <>
        {slot.props.title}
        {hoverCardElement}
      </>
    ) : (
      hoverCardElement
    ),
  });

  return slotWithHoverCard;
};

export default ComponentWithHoverCard;
