/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import styled from 'styled-components';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

const Panel = styled(Layout)`
  background-color: ${Theme.white};
  border: 1px solid ${Theme.lightBlue};
  margin-top: 5px;
`;

const Heading = styled.div`
  display: flex;
  padding: 10px 15px;
  min-height: 35px;
  background-color: ${Theme.lightBlue};
  border-color: ${Theme.mediumBlue};
`;

const Footer = styled.div`
  display: flex;
  padding: 10px 15px;
  border-bottom: 1px solid ${Theme.lightBlue};
  min-height: 35px;
  background-color: ${Theme.lightBlue};
`;

const Body = styled.div`
  display: flex;
  padding: 15px;
  flex-grow: 1;
`;

const InfoPanel = ({heading, footer, children, ...props}) => {
  return (
    <Panel {...props} align={['start', 'stretch']} flex="column">
      {heading && <Heading>{heading}</Heading>}
      {children && <Body>{children}</Body>}
      {footer && <Footer>{footer}</Footer>}
    </Panel>
  );
};

InfoPanel.propTypes = {
  footer: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  heading: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default InfoPanel;

// vim: set ts=2 sw=2 tw=80:
