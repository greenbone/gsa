/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import './css/section.css';

export const Section = props => {
  let {className} = props;
  return (
    <section className={className}>
      <SectionHeader img={props.img} title={props.title}>
        {props.extra}
      </SectionHeader>
      {props.children}
    </section>
  );
};

Section.propTypes = {
  className: React.PropTypes.string,
  img: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.element,
  ]).isRequired,
  title: React.PropTypes.string.isRequired,
  extra: React.PropTypes.element,
};

export const SectionHeader = props => {
  return (
    <Layout flex align={['space-between', 'end']} className="section-header">
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
  ]).isRequired,
  title: React.PropTypes.string.isRequired,
};

export default Section;

// vim: set ts=2 sw=2 tw=80:
