/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import glamorous from 'glamorous';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Icon from 'web/components/icon/icon';

import Divider from 'web/components/layout/divider';

import InfoPanel from 'web/components/panel/infopanel';

const Content = glamorous.span(
  ({onClick}) => {
    if (!isDefined(onClick)) {
      return undefined;
    }

    return {
      ':hover': {
        textDecoration: 'underline',
      },
      cursor: 'pointer',
    };
  }
);

const ReportPanel = ({
  children,
  icon,
  title,
  onClick,
}) => {
  return (
    <InfoPanel
      heading={title}
    >
      <Divider
        margin="1em"
        align={['start', 'center']}
      >
        <Icon
          size="large"
          img={icon}
          onClick={onClick}
        />
        <Content onClick={onClick}>
          {children}
        </Content>
      </Divider>
    </InfoPanel>
  );
};

ReportPanel.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default ReportPanel;

// vim: set ts=2 sw=2 tw=80:
