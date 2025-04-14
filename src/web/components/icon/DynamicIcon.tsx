/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ActionIcon, ActionIconProps} from '@mantine/core';
import {isDefined} from 'gmp/utils/identity';
import {LucideIcon} from 'lucide-react';
import React, {useState} from 'react';
import useIconSize, {IconSizeType} from 'web/hooks/useIconSize';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

export type ExtendedIconSize = IconSizeType | [string, string];

export interface DynamicIconProps<TValue = string>
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
  strokeWidth?: number;
  onClick?: (value?: TValue) => void | Promise<void>;
  dataTestId?: string;
  forceStatic?: boolean;
}

export function DynamicIcon<TValue = string>({
  icon: Icon,
  ariaLabel,
  size = 'small',
  active = true,
  title,
  loadingTitle,
  strokeWidth,
  color = 'black',
  value,
  variant = 'transparent',
  dataTestId,
  forceStatic = false,
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

    const result = onClick(value);

    if (isDefined(result?.then)) {
      try {
        setLoading(true);
        await result;
      } finally {
        setLoading(false);
      }
    }
  };

  if (forceStatic || (active && !isDefined(onClick))) {
    return (
      <span
        data-testid={dataTestId}
        style={{display: 'inline-flex', color}}
        title={title}
      >
        <Icon height={height} strokeWidth={strokeWidth} width={width} />
      </span>
    );
  }

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
      <Icon height={height} strokeWidth={strokeWidth} width={width} />
    </ActionIcon>
  );
}
export default DynamicIcon;

DynamicIcon.displayName = 'DynamicIcon';
