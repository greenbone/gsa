// @flow
/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
/* Copyright (C) 2019 Greenbone Networks GmbH
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

class GraphUtils {
  static getNodesMap(arr, key) {
    const map = {};
    let item = null;
    for (let i = 0; i < arr.length; i++) {
      item = arr[i];
      map[`key-${item[key]}`] = {
        children: [],
        incomingEdges: [],
        node: item,
        originalArrIndex: i,
        outgoingEdges: [],
        parents: [],
      };
    }
    return map;
  }

  static getEdgesMap(arr) {
    const map = {};
    let item = null;
    for (let i = 0; i < arr.length; i++) {
      item = arr[i];
      if (!item.target) {
        continue;
      }
      map[`${item.source || ''}_${item.target}`] = {
        edge: item,
        originalArrIndex: i,
      };
    }
    return map;
  }

  static linkNodesAndEdges(nodesMap, edges) {
    let nodeMapSourceNode = null;
    let nodeMapTargetNode = null;
    let edge = null;
    for (let i = 0; i < edges.length; i++) {
      edge = edges[i];
      if (!edge.target) {
        continue;
      }
      nodeMapSourceNode = nodesMap[`key-${edge.source || ''}`];
      nodeMapTargetNode = nodesMap[`key-${edge.target}`];
      // avoid an orphaned edge
      if (nodeMapSourceNode && nodeMapTargetNode) {
        nodeMapSourceNode.outgoingEdges.push(edge);
        nodeMapTargetNode.incomingEdges.push(edge);
        nodeMapSourceNode.children.push(nodeMapTargetNode);
        nodeMapTargetNode.parents.push(nodeMapSourceNode);
      }
    }
  }

  static removeElementFromDom(id) {
    const container = document.getElementById(id);
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      return true;
    }
    return false;
  }

  static findParent(element, selector) {
    if (element && element.matches && element.matches(selector)) {
      return element;
    } else if (element && element.parentNode) {
      return GraphUtils.findParent(element.parentNode, selector);
    }
    return null;
  }

  static classNames(...args) {
    let className = '';
    for (const arg of args) {
      if (typeof arg === 'string' || typeof arg === 'number') {
        className += ` ${arg}`;
      } else if (
        typeof arg === 'object' &&
        !Array.isArray(arg) &&
        arg !== null
      ) {
        Object.keys(arg).forEach(key => {
          if (Boolean(arg[key])) {
            className += ` ${key}`;
          }
        });
      } else if (Array.isArray(arg)) {
        className += ` ${arg.join(' ')}`;
      }
    }

    return className.trim();
  }

  static yieldingLoop(count, chunksize, callback, finished) {
    var i = 0;
    (function chunk() {
      var end = Math.min(i + chunksize, count);
      for (; i < end; ++i) {
        callback.call(null, i);
      }
      if (i < count) {
        setTimeout(chunk, 0);
      } else {
        finished && finished(null);
      }
    })();
  }

  static hasNodeShallowChanged(prevNode, newNode) {
    const prevNodeKeys = Object.keys(prevNode);
    const newNodeKeys = Object.keys(prevNode);
    const checkedKeys = {};
    for (let i = 0; i < prevNodeKeys.length; i++) {
      const key = prevNodeKeys[i];
      if (!newNode.hasOwnProperty(key) || prevNode[key] !== newNode[key]) {
        return true;
      }
      checkedKeys[key] = true;
    }
    for (let i = 0; i < newNodeKeys.length; i++) {
      const key = newNodeKeys[i];
      if (checkedKeys[key]) {
        continue;
      }
      if (!prevNode.hasOwnProperty(key) || prevNode[key] !== newNode[key]) {
        return true;
      }
    }
    return false;
  }
}

export default GraphUtils;

// vim: set ts=2 sw=2 tw=80:
