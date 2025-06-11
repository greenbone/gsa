/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, useRef, useCallback} from 'react';
import 'whatwg-fetch';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import useIconSize from 'web/hooks/useIconSize';
import Theme from 'web/utils/Theme';
import {get_img_url} from 'web/utils/Urls';

interface StyledIconProps {
  $height: string;
  $lineHeight: string;
  $width: string;
}

interface IconProps<TValue> {
  to?: string;
  value?: TValue;
  onClick?: (value: TValue | undefined) => void;
  img: string;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  active?: boolean;
}

const Anchor = styled.a`
  display: flex;
`;

const StyledIcon = styled.span<StyledIconProps>`
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

interface StyledDivProps {
  $active?: boolean;
}

const StyledDiv = styled.div<StyledDivProps>`
  & svg path {
    fill: ${props => {
      const {$active = true} = props;
      return $active ? undefined : Theme.inputBorderGray;
    }};
  }
`;

const IconComponent = <TValue,>({
  active,
  to,
  value,
  onClick,
  img,
  size,
  ...other
}: IconProps<TValue>) => {
  const [svgComponent, setSvgComponent] = useState<null | HTMLElement>(null);
  const svgRef = useRef<HTMLInputElement | null>(null);
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
    void loadImage();
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
          <StyledDiv ref={svgRef} $active={active} />
        </Anchor>
      ) : (
        <StyledDiv ref={svgRef} $active={active} />
      )}
    </StyledIcon>
  );
};

export default IconComponent;
