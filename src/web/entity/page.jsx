/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import styled from 'styled-components';

import {typeName} from 'gmp/utils/entitytype';

import {isDefined} from 'gmp/utils/identity';

import {shorten} from 'gmp/utils/string';

import PropTypes from 'web/utils/proptypes';

import Toolbar from 'web/components/bar/toolbar';

import ErrorMessage from 'web/components/error/errormessage';

import Message from 'web/components/error/message';

import Layout from 'web/components/layout/layout';

import Loading from 'web/components/loading/loading';

import Section from 'web/components/section/section';

import EntityInfo from './info';

export const Col = styled.col`
  width: ${props => props.width};
`;

const ErrorContent = styled.div`
  white-space: pre;
`;

const MessageContent = styled.div`
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

          if (entityType === 'cpe') {
            content = _(
              '\nThis could have the following reasons:\n' +
                '1. The CPE might not be included in the official NVD CPE dictionary ' +
                'yet, and no additional information is available.\n' +
                '2. You might have followed an incorrect link and the CPE does ' +
                'not exist.',
            );
          }

          if (entityType === 'cve') {
            content = _(
              '\nThis could have the following reasons:\n' +
                '1. The CVE might not be included in the SCAP database yet. ' +
                'For new CVEs it can take a month or more until they become ' +
                'available.\n' +
                '2. You might have followed an incorrect link and the CVE does ' +
                'not exist.',
            );
          }

          if (entityType === 'cpe' || entityType === 'cve') {
            return (
              <Message
                flex="column"
                message={_(
                  'The {{entity}} you were looking for could not be found.',
                  {
                    entity: typeName(entityType),
                  },
                )}
              >
                <MessageContent>{content}</MessageContent>
              </Message>
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
