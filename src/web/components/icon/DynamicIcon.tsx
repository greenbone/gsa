/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {ActionIcon, type ActionIconProps} from '@mantine/core';
import {type LucideIcon} from 'lucide-react';
import {isDefined} from 'gmp/utils/identity';
import useIconSize, {type IconSizeType} from 'web/hooks/useIconSize';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

export type ExtendedIconSize = IconSizeType | [string, string];

export interface DynamicIconProps<TValue = string | undefined>
  extends Omit<ActionIconProps, 'size' | 'children'> {
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  ariaLabel?: string;
  size?: ExtendedIconSize;
  color?: string;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  loadingTitle?: string;
  value?: TValue;
  dataTestId?: string;
  forceStatic?: boolean;
  isLucide?: boolean;
  onClick?: (value: TValue) => void | Promise<void>;
}

const inheritColor = undefined;

export function DynamicIcon<TValue = string | undefined>({
  icon: Icon,
  ariaLabel,
  size = 'small',
  active = true,
  title,
  loadingTitle,
  color = 'black',
  value,
  variant = 'transparent',
  dataTestId,
  forceStatic = false,
  isLucide = false,
  onClick,
  ...restProps
}: Readonly<DynamicIconProps<TValue>>) {
  const [_] = useTranslation();
  const [loading, setLoading] = useState(false);
  const {width, height} = useIconSize(size);

  const mantineSize = Array.isArray(size)
    ? Math.max(parseInt(size[0]), parseInt(size[1])) + 'px'
    : size;

  const hasLoadingTitle = loadingTitle ?? _('Loading...');

  const displayedTitle = loading ? hasLoadingTitle : title;

  const handleClick = async () => {
    if (!onClick || !active || loading) {
      return;
    }

    const result = onClick(value as TValue);

    if (isDefined(result?.then)) {
      try {
        setLoading(true);
        await result;
      } finally {
        setLoading(false);
      }
    }
  };

  const renderActionIcon = (child: React.ReactNode) => {
    return (
      <ActionIcon
        aria-label={ariaLabel}
        color={color}
        data-testid={dataTestId}
        disabled={!active || loading}
        loaderProps={{
          type: 'bars',
          color: Theme.darkGray,
          size: width,
        }}
        loading={loading}
        size={mantineSize}
        title={displayedTitle}
        variant={variant}
        onClick={handleClick}
        {...restProps}
      >
        {child}
      </ActionIcon>
    );
  };

  const renderSpanIcon = (child: React.ReactNode) => {
    return (
      <span
        aria-label={ariaLabel}
        data-testid={dataTestId}
        style={{display: 'inline-flex'}}
        title={displayedTitle}
      >
        {child}
      </span>
    );
  };

  /*
   * - SVG icons from Lucide package
   */

  if (isLucide) {
    const defaultLucideStrokeWidth = 1.5;
    if (forceStatic || (active && !isDefined(onClick))) {
      return renderSpanIcon(
        <Icon
          color={color}
          height={height}
          strokeWidth={defaultLucideStrokeWidth}
          width={width}
        />,
      );
    }

    return renderActionIcon(
      <Icon
        height={height}
        strokeWidth={defaultLucideStrokeWidth}
        width={width}
      />,
    );
  }

  /*
   * - SVG icons not from Lucide package
   */

  const svgIconsStyle = !isLucide
    ? {fill: !active ? 'var(--mantine-color-gray-5)' : inheritColor}
    : inheritColor;

  if (forceStatic || (active && !isDefined(onClick))) {
    return renderSpanIcon(
      <Icon
        height={height}
        style={{
          fill: color,
        }}
        width={width}
      />,
    );
  }

  return renderActionIcon(
    <Icon height={height} style={svgIconsStyle} width={width} />,
  );
}
export default DynamicIcon;

DynamicIcon.displayName = 'DynamicIcon';
