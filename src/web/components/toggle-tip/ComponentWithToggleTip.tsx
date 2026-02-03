/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, type ReactElement, useRef, cloneElement} from 'react';
import ToggleTip, {
  type ToggleTipPosition,
} from 'web/components/toggle-tip/ToggleTip';

interface ComponentWithToggleTipProps {
  /** The component (TextField, NumberField, etc.) */
  slot: ReactElement;
  /** The help content to display in the toggletip */
  helpContent: ReactNode;
  /** Aria label for the help button */
  helpAriaLabel?: string;
  /** Position of the toggletip relative to the help icon */
  position?: ToggleTipPosition;
  /** Data test ID for the toggletip */
  dataTestId?: string;
}

/**
 * Wrapper component that adds a Toggletip to a component
 * The toggletip will remain open when the user clicks on the component
 * and will not close unless clicking outside of it
 *
 * @example
 * <ComponentWithToggletip
 *   slot={<TextField name="cron" value={value} onChange={onChange} />}
 *   helpContent="Enter a custom cron expression..."
 *   helpAriaLabel="More info about cron format"
 * />
 */
const ComponentWithToggleTip = ({
  slot,
  helpContent,
  helpAriaLabel = 'More information',
  position = 'top',
  dataTestId,
}: ComponentWithToggleTipProps) => {
  const slotContainerRef = useRef<HTMLDivElement>(null);

  // Clone the slot element and provide a safe title that includes the toggletip.
  // If the wrapped component doesn't have a `title` prop, render the toggletip alone.
  const slotWithToggletip = cloneElement(slot, {
    title: slot.props.title ? (
      <>
        {slot.props.title}
        <ToggleTip
          ariaLabel={helpAriaLabel}
          dataTestId={dataTestId}
          position={position}
          relatedRefs={[slotContainerRef]}
        >
          {helpContent}
        </ToggleTip>
      </>
    ) : (
      <ToggleTip
        ariaLabel={helpAriaLabel}
        dataTestId={dataTestId}
        position={position}
        relatedRefs={[slotContainerRef]}
      >
        {helpContent}
      </ToggleTip>
    ),
  });

  return <div ref={slotContainerRef}>{slotWithToggletip}</div>;
};

export default ComponentWithToggleTip;
