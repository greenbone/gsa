/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Divider from 'web/components/layout/Divider';
import InfoPanel from 'web/components/panel/InfoPanel';

interface ReportPanelProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}

const Content = styled.span<{onClick?: () => void}>`
  ${props => {
    if (!isDefined(props.onClick)) {
      return undefined;
    }

    return {
      ':hover': {
        textDecoration: 'underline',
      },
      cursor: 'pointer',
    };
  }}
`;

const ReportPanel = ({children, icon, title, onClick}: ReportPanelProps) => {
  return (
    <InfoPanel heading={title}>
      <Divider align={['start', 'center']} margin="1em">
        {icon}
        <Content onClick={onClick}>{children}</Content>
      </Divider>
    </InfoPanel>
  );
};

export default ReportPanel;
