/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, type ReactElement, cloneElement} from 'react';
import InfoTip, {type InfoTipPosition} from 'web/components/info-tip/InfoTip';
import useTranslation from 'web/hooks/useTranslation';

interface ComponentWithInfoTipProps {
  /** The component (TextField, NumberField, etc.) */
  slot: ReactElement;
  /** The help content to display in the infotip */
  helpContent: ReactNode;
  /** Aria label for the help button */
  helpAriaLabel?: string;
  /** Position of the infotip relative to the help icon */
  position?: InfoTipPosition;
  /** Data test ID for the infotip */
  dataTestId?: string;
}

/**
 * Wrapper component that adds an InfoTip to a component
 * Shows on hover like a traditional tooltip
 *
 * @example
 * <ComponentWithInfoTip
 *   slot={<TextField name="cron" value={value} onChange={onChange} />}
 *   helpContent="Enter a custom cron expression..."
 *   helpAriaLabel="More info about cron format"
 * />
 *
 * @example
 * <ComponentWithInfoTip
 *   slot={<FormGroup title={_('Schedule')} direction="row">...</FormGroup>}
 *   helpContent="Schedule help text"
 *   helpAriaLabel="More info about schedules"
 * />
 */
const ComponentWithInfoTip = ({
  slot,
  helpContent,
  helpAriaLabel,
  position,
  dataTestId,
}: ComponentWithInfoTipProps) => {
  const [_] = useTranslation();
  const ariaLabel = helpAriaLabel || _('More info');

  // Create the InfoTip element
  const infoTipElement = (
    <InfoTip ariaLabel={ariaLabel} dataTestId={dataTestId} position={position}>
      {helpContent}
    </InfoTip>
  );

  // Clone the slot element and add the infoTip to its title
  const slotWithInfoTip = cloneElement(slot, {
    ...slot.props,
    title: slot.props.title ? (
      <>
        {slot.props.title}
        {infoTipElement}
      </>
    ) : (
      infoTipElement
    ),
  });

  return slotWithInfoTip;
};

export default ComponentWithInfoTip;
