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

import * as d3 from 'd3';
import * as React from 'react';
import Edge from './edge';
import GraphUtils from './graph-util';
import NodeText from './node-text';

import PropTypes from 'web/utils/proptypes';

class Node extends React.Component {
  static defaultProps = {
    isSelected: false,
    nodeSize: 154,
    onNodeMouseEnter: () => {
      return;
    },
    onNodeMouseLeave: () => {
      return;
    },
    onNodeMove: () => {
      return;
    },
    onNodeSelected: () => {
      return;
    },
    onNodeUpdate: () => {
      return;
    },
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      selected: nextProps.isSelected,
      x: nextProps.data.x,
      y: nextProps.data.y,
    };
  }

  constructor(...props) {
    super(...props);

    this.state = {
      drawingEdge: false,
      hovered: false,
      mouseDown: false,
      selected: false,
      x: this.props.data.x || 0,
      y: this.props.data.y || 0,
    };

    this.nodeRef = React.createRef();
  }

  componentDidMount() {
    const dragFunction = d3
      .drag()
      .on('drag', this.handleMouseMove)
      .on('start', this.handleDragStart)
      .on('end', this.handleDragEnd);
    d3.select(this.nodeRef.current)
      .on('mouseout', this.handleMouseOut)
      .call(dragFunction);
  }

  handleMouseMove = () => {
    const mouseButtonDown = d3.event.sourceEvent.buttons === 1;
    const {shiftKey} = d3.event.sourceEvent;
    const {nodeSize, nodeKey, viewWrapperElem} = this.props;
    if (!mouseButtonDown) {
      return;
    }

    // While the mouse is down, this function handles all mouse movement
    const newState = {
      x: d3.event.x,
      y: d3.event.y,
    };

    if (shiftKey) {
      this.setState({drawingEdge: true});
      // draw edge
      // undo the target offset subtraction done by Edge
      const off = Edge.calculateOffset(
        nodeSize,
        this.props.data,
        newState,
        nodeKey,
        true,
        viewWrapperElem,
      );
      newState.x += off.xOff;
      newState.y += off.yOff;
      // now tell the graph that we're actually drawing an edge
    }
    this.setState(newState);
    // Never use this.props.index because if the nodes array changes order
    // then this function could move the wrong node.
    this.props.onNodeMove(newState, this.props.data[nodeKey], shiftKey);
  };

  handleDragStart = () => {
    if (!this.nodeRef.current) {
      return;
    }
    if (!this.oldSibling) {
      this.oldSibling = this.nodeRef.current.parentElement.nextSibling;
    }
    // Moves child to the end of the element stack to re-arrange the z-index
    this.nodeRef.current.parentElement.parentElement.appendChild(
      this.nodeRef.current.parentElement,
    );
  };

  handleDragEnd = () => {
    if (!this.nodeRef.current) {
      return;
    }
    const {x, y, drawingEdge} = this.state;
    const {data, index, nodeKey} = this.props;
    this.setState({mouseDown: false, drawingEdge: false});

    if (this.oldSibling && this.oldSibling.parentElement) {
      this.oldSibling.parentElement.insertBefore(
        this.nodeRef.current.parentElement,
        this.oldSibling,
      );
    }

    const {shiftKey} = d3.event.sourceEvent;
    this.props.onNodeUpdate({x, y}, data[nodeKey], shiftKey || drawingEdge);

    this.props.onNodeSelected(data, data[nodeKey], shiftKey || drawingEdge);
  };

  handleMouseOver = event => {
    // Detect if mouse is already down and do nothing.
    let hovered = false;
    if (
      (d3.event && d3.event.buttons !== 1) ||
      (event && event.buttons !== 1)
    ) {
      hovered = true;
      this.setState({hovered});
    }

    this.props.onNodeMouseEnter(event, this.props.data, hovered);
  };

  handleMouseOut = event => {
    // Detect if mouse is already down and do nothing. Sometimes the system lags on
    // drag and we don't want the mouseOut to fire while the user is moving the
    // node around

    this.setState({hovered: false});
    this.props.onNodeMouseLeave(event, this.props.data);
  };

  static getNodeTypeXlinkHref(data, nodeTypes) {
    if (data.type && nodeTypes[data.type]) {
      return nodeTypes[data.type].shapeId;
    } else if (nodeTypes.emptyNode) {
      return nodeTypes.emptyNode.shapeId;
    }
    return null;
  }

  static getNodeSubtypeXlinkHref(data, nodeSubtypes) {
    if (data.subtype && nodeSubtypes && nodeSubtypes[data.subtype]) {
      return nodeSubtypes[data.subtype].shapeId;
    } else if (nodeSubtypes && nodeSubtypes.emptyNode) {
      return nodeSubtypes.emptyNode.shapeId;
    }
    return null;
  }

  renderShape() {
    const {
      renderNode,
      data,
      index,
      nodeTypes,
      nodeSubtypes,
      nodeKey,
    } = this.props;
    const {hovered, selected} = this.state;
    const props = {
      height: this.props.nodeSize || 0,
      width: this.props.nodeSize || 0,
    };
    const nodeShapeContainerClassName = GraphUtils.classNames('shape');
    const nodeClassName = GraphUtils.classNames('node', {selected, hovered});
    const nodeSubtypeClassName = GraphUtils.classNames('subtype-shape', {
      selected: this.state.selected,
    });
    const nodeTypeXlinkHref = Node.getNodeTypeXlinkHref(data, nodeTypes) || '';
    const nodeSubtypeXlinkHref =
      Node.getNodeSubtypeXlinkHref(data, nodeSubtypes) || '';

    // get width and height defined on def element
    const defSvgNodeElement = nodeTypeXlinkHref
      ? document.querySelector(`defs>${nodeTypeXlinkHref}`)
      : null;
    const nodeWidthAttr = defSvgNodeElement
      ? defSvgNodeElement.getAttribute('width')
      : 0;
    const nodeHeightAttr = defSvgNodeElement
      ? defSvgNodeElement.getAttribute('height')
      : 0;
    props.width = nodeWidthAttr ? parseInt(nodeWidthAttr, 10) : props.width;
    props.height = nodeHeightAttr ? parseInt(nodeHeightAttr, 10) : props.height;

    if (renderNode) {
      // Originally: graphView, domNode, datum, index, elements.
      return renderNode(this.nodeRef, data, data[nodeKey], selected, hovered);
    }
    return (
      <g className={nodeShapeContainerClassName} {...props}>
        {!!data.subtype && (
          <use
            data-index={index}
            className={nodeSubtypeClassName}
            x={-props.width / 2}
            y={-props.height / 2}
            width={props.width}
            height={props.height}
            xlinkHref={nodeSubtypeXlinkHref}
          />
        )}
        <use
          data-index={index}
          className={nodeClassName}
          x={-props.width / 2}
          y={-props.height / 2}
          width={props.width}
          height={props.height}
          xlinkHref={nodeTypeXlinkHref}
        />
      </g>
    );
  }

  renderText() {
    const {data, index, id, nodeTypes, renderNodeText, isSelected} = this.props;
    if (renderNodeText) {
      return renderNodeText(data, id, isSelected);
    }
    return (
      <NodeText
        data={data}
        nodeTypes={nodeTypes}
        isSelected={this.state.selected}
      />
    );
  }

  render() {
    const {x, y, hovered, selected} = this.state;
    const {opacity, id, data} = this.props;
    const className = GraphUtils.classNames('node', data.type, {
      hovered,
      selected,
    });
    return (
      <g
        className={className}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
        id={id}
        ref={this.nodeRef}
        opacity={opacity}
        transform={`translate(${x}, ${y})`}
      >
        {this.renderShape()}
        {this.renderText()}
      </g>
    );
  }
}

Node.propTypes = {
  // data: INode;
  // id: string;
  // nodeTypes: any; // TODO: make a nodeTypes interface
  // nodeSubtypes: any; // TODO: make a nodeSubtypes interface
  // opacity?: number;
  // nodeKey: string;
  // nodeSize?: number;
  // onNodeMouseEnter: (event: any, data: any, hovered: boolean) => void;
  // onNodeMouseLeave: (event: any, data: any) => void;
  // onNodeMove: (point: IPoint, id: string, shiftKey: boolean) => void;
  // onNodeSelected: (data: any, id: string, shiftKey: boolean) => void;
  // onNodeUpdate: (point: IPoint, id: string, shiftKey: boolean) => void;
  // renderNode?: (
  //   nodeRef: any,
  //   data: any,
  //   id: string,
  //   selected: boolean,
  //   hovered: boolean
  // ) => any;
  // renderNodeText?: (data: any, id: string | number, isSelected: boolean) => any;
  // isSelected: boolean;
  // viewWrapperElem: HTMLDivElement;
};

export default Node;
