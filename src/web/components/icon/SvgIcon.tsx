/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined, isFunction} from 'gmp/utils/identity';
import React, {useEffect, useState, useRef} from 'react';
import styled from 'styled-components';
import useIconSize from 'web/hooks/useIconSize';
import Theme from 'web/utils/Theme';

const Anchor = styled.a`
  display: flex;
`;

interface StyledSpanProps {
  $active: boolean;
  $height: string;
  $isLoading: boolean;
  $width: string;
  color: string;
}

const StyledSpan = styled.span<StyledSpanProps>`
  cursor: ${props => (props.onClick ? 'pointer' : undefined)};
  width: ${props => props.$width};
  height: ${props => props.$height};
  color: ${props => (props.$active ? props.color : Theme.inputBorderGray)};

  @media print {
    & {
      ${props => (isDefined(props.onClick) ? 'display: none;' : undefined)};
    }
  }

  & svg {
    background: ${props =>
      props.$isLoading
        ? 'url(/img/loading.gif) center center no-repeat'
        : undefined};
    height: ${props => props.$height};
    width: ${props => props.$width};
  }

  & svg path {
    display: ${props => (props.$isLoading ? 'none' : undefined)};
  }
  // This CSS rule sets the fill color of the SVG path elements with the class 'gui_icon_class'.
  // Local icons need the class 'gui_icon_class' to be styled correctly, while Lucide icons
  // do not need this class, as they are styled by the Lucide library with the property 'color'.
  & svg path.gui_icon_class {
    fill: ${props =>
      props.$active || props.$isLoading ? 'unset' : Theme.inputBorderGray};
  }
`;

export const useIsMountedRef = () => {
  const ref = useRef<boolean | undefined>();
  ref.current = true;
  // if the ref changes, which is the case when the component unmounts
  // set the ref.current to false in order to prevent state updates in
  // useStateWithMountCheck()
  useEffect(() => {
    return () => {
      ref.current = false;
    };
  }, [ref]);

  return ref;
};

// only update state if the component is mounted
// use useIsMountedRef() to track mounted status across renders
export const useStateWithMountCheck = <T,>(
  initialState: T,
): [T, (arg: T) => void] => {
  const isMountedRef = useIsMountedRef();
  const [nativeState, setNativeState] = useState<T>(initialState);
  const setState = (arg: T) => {
    if (isMountedRef.current) {
      setNativeState(arg);
    }
  };
  return [nativeState, setState];
};

export interface SvgIconProps<T> {
  color?: string;
  active?: boolean;
  disabled?: boolean;
  loadingTitle?: string;
  title?: string;
  to?: string;
  value?: T;
  onClick?: (value: T) => void | Promise<void>;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  ['data-testid']?: string;
  [key: string]: unknown;
}

export interface SvgIconRenderProps {
  title: string;
}

interface SvgIconPropsWithChildren<T> extends SvgIconProps<T> {
  children:
    | React.ReactNode
    | React.ReactNode[]
    | ((props: SvgIconRenderProps) => React.ReactNode);
}

const SvgIcon = <T,>({
  disabled = false,
  active = !disabled,
  children,
  loadingTitle = _('Loading...'),
  title,
  to,
  value,
  onClick,
  size,
  color = Theme.black,
  ['data-testid']: dataTestId = 'svg-icon',
  ...other
}: SvgIconPropsWithChildren<T>) => {
  const [loading, setLoading] = useStateWithMountCheck(false);
  const {width, height} = useIconSize(size);

  const handleClick = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    if (!isDefined(onClick)) {
      return;
    }

    const promise = onClick(value as T);

    if (isDefined(promise?.then)) {
      setLoading(true);

      promise
        .then(() => {
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          throw error;
        });
    }
  };

  title = loading ? loadingTitle : title;

  if (isFunction(children)) {
    // @ts-expect-error
    children = children({title});
  }

  return (
    <StyledSpan
      {...other}
      $active={active && !loading}
      $height={height}
      $isLoading={loading}
      $width={width}
      color={color}
      data-testid={dataTestId}
      title={title}
      onClick={
        isDefined(onClick) && !disabled && !loading ? handleClick : undefined
      }
    >
      {/* @ts-expect-error */}
      {isDefined(to) ? <Anchor href={to}>{children}</Anchor> : children}
    </StyledSpan>
  );
};

export default SvgIcon;
