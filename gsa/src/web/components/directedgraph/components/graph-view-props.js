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

export type IGraphViewProps = {
  backgroundFillId?: string,
  edges: any[],
  edgeArrowSize?: number,
  edgeHandleSize?: number,
  edgeTypes: any,
  gridDotSize?: number,
  gridSize?: number,
  gridSpacing?: number,
  maxTitleChars?: number,
  maxZoom?: number,
  minZoom?: number,
  nodeKey: string,
  nodes: any[],
  nodeSize?: number,
  nodeSubtypes: any,
  nodeTypes: any,
  readOnly?: boolean,
  selected: any,
  showGraphControls?: boolean,
  zoomDelay?: number,
  zoomDur?: number,
  canCreateEdge?: (startNode?: INode, endNode?: INode) => boolean,
  canDeleteEdge?: (selected: any) => boolean,
  canDeleteNode?: (selected: any) => boolean,
  onCopySelected?: () => void,
  onCreateEdge: (sourceNode: INode, targetNode: INode) => void,
  onCreateNode: (x: number, y: number) => void,
  onDeleteEdge: (selectedEdge: IEdge, edges: IEdge[]) => void,
  onDeleteNode: (selected: any, nodeId: string, nodes: any[]) => void,
  onPasteSelected?: () => void,
  onSelectEdge: (selectedEdge: IEdge) => void,
  onSelectNode: (node: INode | null) => void,
  onSwapEdge: (sourceNode: INode, targetNode: INode, edge: IEdge) => void,
  onUndo?: () => void,
  onUpdateNode: (node: INode) => void,
  renderBackground?: (gridSize?: number) => any,
  renderDefs?: () => any,
  renderNode?: (
    nodeRef: any,
    data: any,
    id: string,
    selected: boolean,
    hovered: boolean,
  ) => any,
  afterRenderEdge?: (
    id: string,
    element: any,
    edge: IEdge,
    edgeContainer: any,
    isEdgeSelected: boolean,
  ) => void,
  renderNodeText?: (data: any, id: string | number, isSelected: boolean) => any,
};

// vim: set ts=2 sw=2 tw=80:
