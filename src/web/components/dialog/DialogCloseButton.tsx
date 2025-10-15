/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import useIconSize, {type IconSizeType} from 'web/hooks/useIconSize';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface StyledCloseButtonProps {
  $width: string;
  $height: string;
  $lineHeight: string;
}

interface DialogCloseButtonProps {
  title?: string;
  size?: IconSizeType;
  onClick?: () => void;
}

const StyledCloseButton = styled.div<StyledCloseButtonProps>`
  display: flex;
  font-weight: bold;
  font-size: 12px;
  font-family: ${Theme.Font.default};
  color: ${Theme.darkGreen};
  cursor: pointer;
  border-radius: 2px;
  padding: 0;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${props => props.$width};
  height: ${props => props.$height};
  line-height: ${props => props.$lineHeight};
  :hover {
    border: 1px solid ${Theme.darkGreen};
  }
  & * {
    height: inherit;
    width: inherit;
  }
`;

const DialogCloseButton = ({
  title,
  size = 'medium',
  onClick,
}: DialogCloseButtonProps) => {
  const [_] = useTranslation();
  title = title ?? _('Close');
  const {width, height} = useIconSize(size);

  return (
    <StyledCloseButton
      $height={height}
      $lineHeight={height}
      $width={width}
      data-testid="close-button"
      title={title}
      onClick={onClick}
    >
      ×{/* Javascript unicode: \u00D7 */}
    </StyledCloseButton>
  );
};

export default DialogCloseButton;
