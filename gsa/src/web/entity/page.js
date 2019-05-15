/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Toolbar from 'web/components/bar/toolbar';

import ErrorMessage from 'web/components/error/errormessage';

import Layout from 'web/components/layout/layout';

import Loading from 'web/components/loading/loading';

import Section from 'web/components/section/section';

import EntityInfo from './info';

export const Col = styled.col`
  width: ${props => props.width};
`;

class EntityPage extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {activeTab: 0};

    this.handleActivateTab = this.handleActivateTab.bind(this);
  }

  renderToolbarIcons() {
    const {toolBarIcons: ToolBarIconsComponent, entity, ...other} = this.props;

    if (!isDefined(ToolBarIconsComponent)) {
      return null;
    }

    return <ToolBarIconsComponent entity={entity} {...other} />;
  }

  handleActivateTab(index) {
    const {onInteraction} = this.props;

    this.setState({activeTab: index});

    if (index !== this.state.activeTab && isDefined(onInteraction)) {
      onInteraction();
    }
  }

  renderSection() {
    const {
      children,
      entity,
      sectionIcon,
      sectionComponent: SectionComponent = Section,
      title,
    } = this.props;

    const {activeTab} = this.state;

    if (SectionComponent === false) {
      return null;
    }

    let section_title = title;
    if (isDefined(entity)) {
      section_title = title + ': ' + entity.name;
    }

    return (
      <SectionComponent
        title={section_title}
        className="entity-section"
        img={sectionIcon}
        extra={this.renderInfo()}
      >
        {children({
          activeTab,
          onActivateTab: this.handleActivateTab,
        })}
      </SectionComponent>
    );
  }

  renderInfo() {
    const {entity} = this.props;
    let {infoComponent: InfoComponent} = this.props;

    if (InfoComponent === false) {
      return null;
    }

    if (!isDefined(InfoComponent)) {
      InfoComponent = EntityInfo;
    }

    return (
      <Layout align="start">
        <InfoComponent entity={entity} />
      </Layout>
    );
  }

  render() {
    const {entity, entityError, isLoading = true} = this.props;

    if (!isDefined(entity)) {
      if (isLoading) {
        return <Loading />;
      }
      if (isDefined(entityError)) {
        return <ErrorMessage message={entityError.message} />;
      }
      return null;
    }

    return (
      <Layout flex="column" align="start" grow="1">
        <Toolbar>{this.renderToolbarIcons()}</Toolbar>
        {this.renderSection()}
      </Layout>
    );
  }
}

EntityPage.propTypes = {
  entity: PropTypes.model,
  entityError: PropTypes.object,
  infoComponent: PropTypes.componentOrFalse,
  isLoading: PropTypes.bool,
  sectionComponent: PropTypes.componentOrFalse,
  sectionIcon: PropTypes.icon,
  title: PropTypes.string,
  toolBarIcons: PropTypes.component,
  onInteraction: PropTypes.func.isRequired,
};

export default EntityPage;

// vim: set ts=2 sw=2 tw=80:
