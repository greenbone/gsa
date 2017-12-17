/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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
import $ from 'jquery';

class EventNode {

  constructor(event_node) {
    this.event_node = event_node ? event_node : $('<span/>');
  }

  /**
   * Register an event callback for a specific event triggered by this node
   *
   * @param {String}   event_name The name of the triggered event
   * @param {Function} callback   Function to be called when the event is triggered
   *
   * @return This node
   */
  on(event_name, callback) {
    this.event_node.on(event_name, callback);
    return this;
  }

  /**
   * Unregister an event callback for a specific event triggered by this node
   *
   * @param {String} event_name The name of the triggered event
   *
   * @return {EventNode} This node
   */
  off(event_name) {
    this.event_node.off(event_name);
    return this;
  }

  /**
   * Trigger event
   *
   * @private
   *
   * @param {String} event_name The name of the triggered event
   * @param {Object} data       Data to be passed to the subscriber
   *
   * @return {EventNode} This node
   */
  _trigger(event_name, data) {
    this.event_node.trigger(event_name, data);
    return this;
  }
}

export default EventNode;

// vim: set ts=2 sw=2 tw=80:
