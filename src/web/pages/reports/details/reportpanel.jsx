/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import Divider from 'web/components/layout/divider';
import InfoPanel from 'web/components/panel/infopanel';
import PropTypes from 'web/utils/proptypes';

const Content = styled.span`
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

const ReportPanel = ({children, icon, title, onClick}) => {
  return (
    <InfoPanel heading={title}>
      <Divider align={['start', 'center']} margin="1em">
        {icon({size: 'large', onClick})}
        <Content onClick={onClick}>{children}</Content>
      </Divider>
    </InfoPanel>
  );
};

ReportPanel.propTypes = {
  icon: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default ReportPanel;
