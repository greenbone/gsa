/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined, isFunction} from 'gmp/utils/identity';
import React, {useEffect, useState, useRef} from 'react';
import styled from 'styled-components';
import useIconSize from 'web/hooks/useIconSize';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const Anchor = styled.a`
  display: flex;
`;

const Styled = styled.span`
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
  const ref = useRef();
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
export const useStateWithMountCheck = (...args) => {
  const isMountedRef = useIsMountedRef();
  const [nativeState, setNativeState] = useState(...args);
  const setState = (...arg) => {
    if (isMountedRef.current) {
      setNativeState(...arg);
    }
  };
  return [nativeState, setState];
};

const SvgIcon = ({
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
  ...other
}) => {
  const [loading, setLoading] = useStateWithMountCheck(false);
  const {width, height} = useIconSize(size);

  const handleClick = event => {
    event.preventDefault();
    event.stopPropagation();
    const promise = onClick(value);

    if (isDefined(promise) && isDefined(promise.then)) {
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
    children = children({title});
  }

  return (
    <Styled
      {...other}
      $active={active && !loading}
      $height={height}
      $isLoading={loading}
      $width={width}
      color={color}
      data-testid="svg-icon"
      title={title}
      onClick={
        isDefined(onClick) && !disabled && !loading ? handleClick : undefined
      }
    >
      {isDefined(to) ? <Anchor href={to}>{children}</Anchor> : children}
    </Styled>
  );
};

SvgIcon.propTypes = {
  children: PropTypes.func.isRequired,
  color: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  loadingTitle: PropTypes.string,
  title: PropTypes.string,
  to: PropTypes.string,
  value: PropTypes.any,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
};

export default SvgIcon;
