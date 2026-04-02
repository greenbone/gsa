/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {Tooltip} from '@mantine/core';
import styled from 'styled-components';
import {CheckIcon, CopyIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface CopyToClipboardProps {
  value: string;
  tooltip?: string;
  successTooltip?: string;
}

const CopyIconButton = styled.button<{$copied: boolean}>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: 1px solid
    ${({$copied}) => ($copied ? Theme.green : Theme.mediumDarkGray)};
  border-radius: 4px;
  color: ${({$copied}) => ($copied ? Theme.green : Theme.lightGray)};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${Theme.mediumDarkGray};
  }
`;

const CopyToClipboard = ({
  value,
  tooltip,
  successTooltip,
}: CopyToClipboardProps) => {
  const [_] = useTranslation();
  const [copied, setCopied] = useState(false);

  const tooltipText = tooltip ?? _('Copy to clipboard');
  const successTooltipText = successTooltip ?? _('Copied!');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip withArrow label={copied ? successTooltipText : tooltipText}>
      <CopyIconButton $copied={copied} onClick={handleCopy}>
        {copied ? (
          <CheckIcon forceStatic color="currentColor" />
        ) : (
          <CopyIcon forceStatic color="currentColor" />
        )}
      </CopyIconButton>
    </Tooltip>
  );
};

export default CopyToClipboard;
