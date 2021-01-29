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

import _ from 'gmp/locale';

import styled from 'styled-components';

import {typeName} from 'gmp/utils/entitytype';

import {isDefined} from 'gmp/utils/identity';

import {shorten} from 'gmp/utils/string';

import Toolbar from 'web/components/bar/toolbar';

import ErrorMessage from 'web/components/error/errormessage';

import Layout from 'web/components/layout/layout';

import Loading from 'web/components/loading/loading';

import Section from 'web/components/section/section';

import PropTypes from 'web/utils/proptypes';

import EntityInfo from './info';

export const Col = styled.col`
  width: ${props => props.width};
`;

const ErrorContent = styled.div`
  white-space: pre;
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
      section_title = title + ': ' + shorten(entity.name, 80);
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
    const {entity, entityError, entityType, isLoading = true} = this.props;

    if (!isDefined(entity)) {
      if (isLoading) {
        return <Loading />;
      }
      if (isDefined(entityError)) {
        if (entityError.status === 404) {
          let content = _(
            '\nYou might have followed an incorrect link and the {{entity}} ' +
              'does not exist.',
            {entity: typeName(entityType)},
          );

          if (entityType === 'cve') {
            content = _(
              '\nThis could have the following reasons:\n' +
                '1. You might have followed an incorrect link and the CVE does ' +
                'not exist\n' +
                '2. The CVE might not be included in the SCAP database yet. ' +
                'For new CVEs it can take a month or more until they become ' +
                'available.',
            );
          }

          return (
            <ErrorMessage
              flex="column"
              message={_(
                'The {{entity}} you were looking for could not be found.',
                {
                  entity: typeName(entityType),
                },
              )}
            >
              <ErrorContent>{content}</ErrorContent>
            </ErrorMessage>
          );
        }
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
  entityType: PropTypes.string.isRequired,
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
