/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useState, useEffect, useRef, useCallback} from 'react';
import 'whatwg-fetch';
import styled from 'styled-components';
import useIconSize from 'web/hooks/useIconSize';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';
import {get_img_url} from 'web/utils/Urls';

const Anchor = styled.a`
  display: flex;
`;

const StyledIcon = styled.span`
  cursor: ${props => (isDefined(props.onClick) ? 'pointer' : undefined)};
  width: ${props => props.$width};
  height: ${props => props.$height};
  line-height: ${props => props.$lineHeight};
  @media print {
    & {
      ${props => (isDefined(props.onClick) ? {display: 'none'} : undefined)};
    }
  }
  & * {
    height: inherit;
    width: inherit;
  }
`;

const IconComponent = ({
  className,
  to,
  value,
  onClick,
  img,
  size,
  ...other
}) => {
  const [svgComponent, setSvgComponent] = useState(null);
  const svgRef = useRef(null);
  const {width, height} = useIconSize(size);

  const loadImage = useCallback(async () => {
    const iconPath = get_img_url(img);
    try {
      const response = await fetch(iconPath);
      const resp = await response.text();
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(resp, 'image/svg+xml');
      const svg = doc.documentElement;
      setSvgComponent(svg);
      if (svgRef.current) {
        svgRef.current.appendChild(svg);
      }
    } catch (error) {
      console.error(error);
    }
  }, [img]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  useEffect(() => {
    const currentSvgRef = svgRef.current;

    return () => {
      if (currentSvgRef && svgComponent) {
        try {
          currentSvgRef.removeChild(svgComponent);
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [img, svgComponent]);

  const handleClick = () => {
    if (onClick) {
      onClick(value);
    }
  };

  return (
    <StyledIcon
      $height={height}
      $lineHeight={height}
      $width={width}
      onClick={isDefined(onClick) ? handleClick : undefined}
      {...other}
    >
      {isDefined(to) ? (
        <Anchor href={to}>
          <div ref={svgRef} className={className} />
        </Anchor>
      ) : (
        <div ref={svgRef} className={className} />
      )}
    </StyledIcon>
  );
};

const StyledIconComponent = styled(IconComponent)`
  & svg path {
    fill: ${props => {
      const {active = true} = props;
      return active ? undefined : Theme.inputBorderGray;
    }};
  }
`;

IconComponent.propTypes = {
  to: PropTypes.string,
  value: PropTypes.any,
  onClick: PropTypes.func,
  img: PropTypes.string.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
};

export default StyledIconComponent;
