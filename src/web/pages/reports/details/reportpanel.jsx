/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Divider from 'web/components/layout/divider';

import InfoPanel from 'web/components/panel/infopanel';

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
      <Divider margin="1em" align={['start', 'center']}>
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

// vim: set ts=2 sw=2 tw=80:
