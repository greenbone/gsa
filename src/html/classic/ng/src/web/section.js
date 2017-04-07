/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {is_string} from '../utils.js';

import Layout from './layout.js';

import Icon from './icons/icon.js';
import FoldIcon from './icons/foldicon.js';

import './css/section.css';

import {FoldState, withFolding} from './folding.js';

const FoldableLayout = withFolding(Layout);

class Section extends React.Component {

  constructor (props, ...args) {
    super (props, ...args);
    this.state = {foldState: FoldState.UNFOLDED};
    this.handleFoldToggle = props.onFoldToggle;
    this.handleFoldStepEnd = props.onFoldStepEnd;
  }

  render() {
    let {foldable, foldState,
         className, title, img, extra, children} = this.props;

    console.debug('foldState:' + foldState)
    let Content = foldable ? FoldableLayout : Layout;

    return (
      <section className={className}>
        <SectionHeader img={img} title={title}>
          <Layout
            align={['space-between', 'end']}>
            {extra}
            {foldable ? <FoldIcon foldState={foldState}
                            onFoldToggle={this.handleFoldToggle}/>
                      : null}
          </Layout>
        </SectionHeader>
        <Content grow="1" foldState={foldState}
            onFoldStepEnd={this.handleFoldStepEnd}>
          {children}
        </Content>
      </section>
    );
  }
};

Section.propTypes = {
  className: React.PropTypes.string,
  img: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.element,
  ]),
  title: React.PropTypes.string.isRequired,
  extra: React.PropTypes.element,
};

export const SectionHeader = props => {
  return (
    <Layout
      flex
      align={['space-between', 'end']}
      className="section-header">
      <h2>
        {is_string(props.img) ?
          <Icon size="large" img={props.img}/> : props.img
        }
        {props.title}
      </h2>
      {props.children}
    </Layout>
  );
};

SectionHeader.propTypes = {
  img: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.element,
  ]),
  title: React.PropTypes.string.isRequired,
};

export default Section;

// vim: set ts=2 sw=2 tw=80:
