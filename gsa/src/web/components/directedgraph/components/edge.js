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
import * as lineIntersect from 'line-intersect';
import {intersect, shape} from 'svg-intersections';
import {Point2D, Matrix2D} from 'kld-affine';
import {Intersection} from 'kld-intersections';
import GraphUtils from './graph-util';

import PropTypes from 'web/utils/proptypes';

class Edge extends React.Component {
  static defaultProps = {
    edgeHandleSize: 50,
    isSelected: false,
  };

  static getTheta(pt1, pt2) {
    const xComp = (pt2.x || 0) - (pt1.x || 0);
    const yComp = (pt2.y || 0) - (pt1.y || 0);
    const theta = Math.atan2(yComp, xComp);
    return theta;
  }

  static lineFunction(srcTrgDataArray) {
    // Provides API for curved lines using .curve() Example:
    // https://bl.ocks.org/d3indepth/64be9fc39a92ef074034e9a8fb29dcce
    return d3
      .line()
      .x(d => {
        return d.x;
      })
      .y(d => {
        return d.y;
      })(srcTrgDataArray);
  }

  static getArrowSize(viewWrapperElem = document) {
    const defEndArrowElement = viewWrapperElem.querySelector(
      `defs>marker>.arrow`,
    );
    return defEndArrowElement.getBoundingClientRect();
  }

  static getEdgePathElement(edge, viewWrapperElem = document) {
    return viewWrapperElem.querySelector(
      `#edge-${edge.source}-${
        edge.target
      }-container>.edge-container>.edge>.edge-path`,
    );
  }

  static parsePathToXY(edgePathElement) {
    const response = {
      source: {x: 0, y: 0},
      target: {x: 0, y: 0},
    };
    if (edgePathElement) {
      let d = edgePathElement.getAttribute('d');
      d = d && d.replace(/^M/, '');
      d = d && d.replace(/L/, ',');
      let dArr = (d && d.split(',')) || [];
      dArr = dArr.map(dimension => {
        return parseFloat(dimension);
      });

      if (dArr.length === 4) {
        response.source.x = dArr[0];
        response.source.y = dArr[1];
        response.target.x = dArr[2];
        response.target.y = dArr[3];
      }
    }
    return response;
  }

  static getDefaultIntersectResponse() {
    return {
      xOff: 0,
      yOff: 0,
      intersect: {
        type: 'none',
        point: {
          x: 0,
          y: 0,
        },
      },
    };
  }

  static getCircleIntersect(
    defSvgCircleElement,
    src,
    trg,
    includesArrow = true,
    viewWrapperElem = document,
  ) {
    const response = Edge.getDefaultIntersectResponse();
    // const arrowSize = 4;
    const arrowSize = Edge.getArrowSize(viewWrapperElem);
    const arrowWidth = arrowSize.width;
    const arrowHeight = arrowSize.height;
    const clientRect = defSvgCircleElement.getBoundingClientRect();
    const {parentElement} = defSvgCircleElement;
    let parentWidth = parentElement.getAttribute('width');
    let parentHeight = parentElement.getAttribute('width');
    if (parentWidth) {
      parentWidth = parseFloat(parentWidth);
    }
    if (parentHeight) {
      parentHeight = parseFloat(parentHeight);
    }

    const w = parentWidth ? parentWidth : clientRect.width;
    const h = parentHeight ? parentHeight : clientRect.height;
    const trgX = trg.x || 0;
    const trgY = trg.y || 0;
    const srcX = src.x || 0;
    const srcY = src.y || 0;
    // from the center of the node to the perimeter
    const arrowOffsetDiviser = 1.25;
    const offX = w / 2 + (includesArrow ? arrowWidth / arrowOffsetDiviser : 0);
    const offY = h / 2 + (includesArrow ? arrowHeight / arrowOffsetDiviser : 0);

    // Note: even though this is a circle function, we can use ellipse
    // because all circles are ellipses but not all ellipses are circles.
    const pathIntersect = intersect(
      shape('ellipse', {
        rx: offX,
        ry: offY,
        cx: trgX,
        cy: trgY,
      }),
      shape('line', {x1: srcX, y1: srcY, x2: trgX, y2: trgY}),
    );

    if (pathIntersect.points.length > 0) {
      let xIntersect = pathIntersect.points[0].x;
      let yIntersect = pathIntersect.points[0].y;

      response.xOff = trgX - xIntersect;
      response.yOff = trgY - yIntersect;
      response.intersect = pathIntersect.points[0];
    }
    return response;
  }

  static calculateOffset(
    nodeSize,
    src,
    trg,
    nodeKey,
    includesArrow = true,
    viewWrapperElem = document,
  ) {
    let response = Edge.getDefaultIntersectResponse();

    if (!trg[nodeKey]) {
      return response;
    }

    // Note: document.getElementById is by far the fastest way to get a node.
    // compare 2.82ms for querySelector('#node-a2 use.node') vs
    // 0.31ms and 99us for document.getElementById()
    const nodeElem = document.getElementById(`node-${trg[nodeKey]}`);
    if (!nodeElem) {
      return response;
    }
    const trgNode = nodeElem.querySelector(`use.node`);

    // the test for trgNode.getAttributeNS makes sure we really have a node and not some other type of object
    if (!trgNode || (trgNode && !trgNode.getAttributeNS)) {
      return response;
    }

    const xlinkHref = trgNode.getAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
    );

    if (!xlinkHref) {
      return response;
    }

    const defSvgRectElement = viewWrapperElem.querySelector(
      `defs>${xlinkHref} rect`,
    );
    // Conditionally trying to select the element in other ways is faster than trying to
    // do the selection.
    const defSvgPathElement = !defSvgPathElement
      ? viewWrapperElem.querySelector(`defs>${xlinkHref} path`)
      : null;
    const defSvgCircleElement =
      !defSvgPathElement && !defSvgPathElement
        ? viewWrapperElem.querySelector(
            `defs>${xlinkHref} circle, defs>${xlinkHref} ellipse, defs>${xlinkHref} polygon`,
          )
        : null;

    if (defSvgCircleElement) {
      // it's a circle or some other type
      response = {
        ...response,
        ...Edge.getCircleIntersect(
          defSvgCircleElement,
          src,
          trg,
          includesArrow,
          viewWrapperElem,
        ),
      };
    }

    return response;
  }

  static getXlinkHref(edgeTypes, data) {
    if (data.type && edgeTypes[data.type]) {
      return edgeTypes[data.type].shapeId;
    } else if (edgeTypes.emptyEdge) {
      return edgeTypes.emptyEdge.shapeId;
    }
    return null;
  }

  edgeOverlayRef;

  constructor(...props) {
    super(...props);
    this.edgeOverlayRef = React.createRef();
  }

  getEdgeHandleTranslation = () => {
    const {nodeSize, nodeKey, sourceNode, targetNode, data} = this.props;

    let pathDescription = this.getPathDescription(data);

    pathDescription = pathDescription.replace(/^M/, '');
    pathDescription = pathDescription.replace(/L/, ',');
    const pathDescriptionArr = pathDescription.split(',');

    // [0] = src x, [1] = src y
    // [2] = trg x, [3] = trg y
    const diffX =
      parseFloat(pathDescriptionArr[2]) - parseFloat(pathDescriptionArr[0]);
    const diffY =
      parseFloat(pathDescriptionArr[3]) - parseFloat(pathDescriptionArr[1]);
    const x = parseFloat(pathDescriptionArr[0]) + diffX / 2;
    const y = parseFloat(pathDescriptionArr[1]) + diffY / 2;

    return `translate(${x}, ${y})`;
  };

  getEdgeHandleOffsetTranslation = () => {
    const offset = -(this.props.edgeHandleSize || 0) / 2;
    return `translate(${offset}, ${offset})`;
  };

  getEdgeHandleRotation = (negate = false) => {
    let rotated = false;
    const src = this.props.sourceNode;
    const trg = this.props.targetNode;
    let theta = (Edge.getTheta(src, trg) * 180) / Math.PI;
    if (negate) {
      theta = -theta;
    }
    if (theta > 90 || theta < -90) {
      theta = theta + 180;
      rotated = true;
    }
    return [`rotate(${theta})`, rotated];
  };

  getEdgeHandleTransformation = () => {
    const translation = this.getEdgeHandleTranslation();
    const [rotation] = this.getEdgeHandleRotation();
    const offset = this.getEdgeHandleOffsetTranslation();
    return `${translation} ${rotation} ${offset}`;
  };

  getPathDescription(edge) {
    const {
      sourceNode,
      targetNode,
      nodeKey,
      nodeSize,
      viewWrapperElem,
    } = this.props;
    const trgX = targetNode && targetNode.x ? targetNode.x : 0;
    const trgY = targetNode && targetNode.y ? targetNode.y : 0;
    const srcX = targetNode && sourceNode.x ? sourceNode.x : 0;
    const srcY = targetNode && sourceNode.y ? sourceNode.y : 0;

    // To calculate the offset for a specific node we use that node as the third parameter
    // and the accompanying node as the second parameter, representing where the line
    // comes from and where it's going to. Don't think of a line as a one-way arrow, but rather
    // a connection between two points. In this case, to obtain the offsets for the src we
    // write trg first, then src second. Vice versa to get the offsets for trg.
    const srcOff = Edge.calculateOffset(
      nodeSize || 0,
      targetNode,
      sourceNode,
      nodeKey,
      false,
      viewWrapperElem,
    );
    const trgOff = Edge.calculateOffset(
      nodeSize || 0,
      sourceNode,
      targetNode,
      nodeKey,
      true,
      viewWrapperElem,
    );

    const linePoints = [
      {
        x: srcX - srcOff.xOff,
        y: srcY - srcOff.yOff,
      },
      {
        x: trgX - trgOff.xOff,
        y: trgY - trgOff.yOff,
      },
    ];

    return Edge.lineFunction(linePoints);
  }

  // renderHandleText(data) {
  //   return (
  //     <text
  //       className="edge-text"
  //       textAnchor="middle"
  //       alignmentBaseline="central"
  //       transform={`${this.getEdgeHandleTranslation()}`}
  //     >
  //       {data.handleText}
  //     </text>
  //   );
  // }
  //
  // renderLabelText (data) {
  //   const [rotation, isRotated] = this.getEdgeHandleRotation()
  //   const title = isRotated ? `${data.label_to} ↔ ${data.label_from}` : `${data.label_from} ↔ ${data.label_to}`
  //   return (
  //     <text
  //       className="edge-text"
  //       textAnchor="middle"
  //       alignmentBaseline="central"
  //       style={{fontSize: '11px', stroke: 'none', fill: 'black'}}
  //       transform={`${this.getEdgeHandleTranslation()} ${rotation} translate(0,-5)`}
  //     >
  //       {title}
  //     </text>
  //   );
  // }

  render() {
    const {data, edgeTypes, edgeHandleSize, viewWrapperElem} = this.props;
    if (!viewWrapperElem) {
      return null;
    }
    const id = `${data.source || ''}_${data.target}`;
    const className = GraphUtils.classNames('edge', {
      selected: this.props.isSelected,
    });

    return (
      <g
        className="edge-container"
        data-source={data.source}
        data-target={data.target}
      >
        <g className={className}>
          <path
            className="edge-path"
            d={this.getPathDescription(data) || undefined}
          />
          <use
            xlinkHref={Edge.getXlinkHref(edgeTypes, data)}
            width={edgeHandleSize}
            height={edgeHandleSize}
            transform={`${this.getEdgeHandleTransformation()}`}
          />
          {data.handleText && this.renderHandleText(data)}
          {data.label_from && data.label_to && this.renderLabelText(data)}
        </g>
        <g className="edge-mouse-handler">
          <path
            className="edge-overlay-path"
            ref={this.edgeOverlayRef}
            id={id}
            data-source={data.source}
            data-target={data.target}
            d={this.getPathDescription(data) || undefined}
          />
        </g>
      </g>
    );
  }
}

Edge.propTypes = {
  // data: IEdge;
  edgeHandleSize: PropTypes.number,
  edgeTypes: PropTypes.any,
  isSelected: PropTypes.bool,
  nodeKey: PropTypes.string,
  nodeSize: PropTypes.number,
  // sourceNode: INode | null;
  // targetNode: INode | ITargetPosition;
  // viewWrapperElem: HTMLDivElement;
};

export default Edge;

// vim: set ts=2 sw=2 tw=80:
