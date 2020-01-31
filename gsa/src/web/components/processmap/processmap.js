/* Copyright (C) 2020 Greenbone Networks GmbH
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

import 'core-js/features/object/keys';

import React from 'react';
import styled from 'styled-components';

import {connect} from 'react-redux';

import {isDefined} from 'gmp/utils/identity';
import {exclude} from 'gmp/utils/object';

import Group from 'web/components/chart/group';
import ErrorBoundary from 'web/components/error/errorboundary';

import {selector as hostSelector} from 'web/store/entities/hosts';

import {saveBusinessProcessMap} from 'web/store/businessprocessmaps/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import Background from './background';
import CreateProcessDialog from './createprocessdialog';
import Edge from './edge';
import ProcessNode from './processnode';
import ProcessPanel from './processpanel';
import Tools from './tools';

const DEFAULT_PROCESS_SIZE = 75;

const Wrapper = styled.div`
  display: flex;
  position: relative;
  height: 100%;
  width: 100%;
`;

const Map = styled.svg`
  display: flex;
  position: relative;
  height: 900px;
  width: 100%;
  align-content: stretch;
  cursor: ${props => props.cursor};
`;

class ProcessMap extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      createProcessDialogVisible: false,
      edgeDrawSource: undefined,
      edgeDrawTarget: undefined,
      translateX: 0,
      translateY: 0,
      isDraggingBackground: false,
      isDraggingProcess: false,
      isDrawingEdge: false,
    };

    this.svg = React.createRef();

    this.createTag = this.createTag.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.handleCloseCreateProcessDialog = this.handleCloseCreateProcessDialog.bind(
      this,
    );
    this.handleDrawEdge = this.handleDrawEdge.bind(this);
    this.handleCreateEdge = this.handleCreateEdge.bind(this);
    this.handleCreateProcess = this.handleCreateProcess.bind(this);
    this.handleSelectElement = this.handleSelectElement.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleProcessChange = this.handleProcessChange.bind(this);
    this.handleDeleteElement = this.handleDeleteElement.bind(this);

    this.keyDownListener = this.keyDownListener.bind(this);
    this.handleOpenCreateProcessDialog = this.handleOpenCreateProcessDialog.bind(
      this,
    );
    this.openCreateProcessDialog = this.openCreateProcessDialog.bind(this);
    this.saveMaps = this.saveMaps.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (isDefined(props.processMaps)) {
      return {
        ...state,
        edges: props.processMaps.edges,
        processes: props.processMaps.processes,
      };
    }
    return {
      ...state,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDownListener);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDownListener);
  }

  componentDidUpdate() {
    const {isDrawingEdge, edgeDrawSource, edgeDrawTarget} = this.state;
    if (
      isDrawingEdge &&
      isDefined(edgeDrawSource) &&
      isDefined(edgeDrawTarget) &&
      edgeDrawSource !== edgeDrawTarget
    ) {
      this.handleCreateEdge(edgeDrawSource, edgeDrawTarget);
    }
  }

  keyDownListener(event) {
    const {createProcessDialogVisible} = this.state;
    switch (event.key) {
      case 'Delete':
        if (isDefined(this.selectedElement) && !createProcessDialogVisible) {
          this.handleDeleteElement();
        }
        break;
      case 'Escape':
        this.setState({isDrawingEdge: false});
        break;
      default: {
        break;
      }
    }
  }

  saveMaps({processes = this.state.processes, edges = this.state.edges}) {
    const {mapId, saveUpdatedMaps} = this.props;

    const updatedMaps = {
      [mapId]: {
        processes,
        edges,
      },
      // ...otherMaps;
    };
    saveUpdatedMaps(updatedMaps);
  }

  handleDeleteElement() {
    const {id} = this.selectedElement;
    const {processes, edges} = this.state;
    if (isDefined(id)) {
      if (this.selectedElement && this.selectedElement.type === 'edge') {
        delete edges[id];

        this.setState({
          edges,
        });
      } else {
        // get all the edges that don't have the process as source or target
        // and exclude those from all edges in order to get a list of attached
        // edges
        const attachedEdges = exclude(edges, key => {
          return id !== edges[key].target && id !== edges[key].source;
        });
        for (const edge in attachedEdges) {
          delete edges[edge];
        }

        delete processes[id];
        this.setState({
          edges,
          processes,
        });
      }
      this.selectedElement = undefined;
      this.saveMaps({processes, edges});
    }
  }

  getMousePosition(event) {
    const {clientX, clientY} = event;
    const {left, top} = this.svg.current.getBoundingClientRect();

    return {
      x: clientX - left,
      y: clientY - top,
    };
  }

  handleOpenCreateProcessDialog() {
    this.selectedElement = undefined; // the dialog will otherwise become an edit dialog
    this.setState({createProcessDialogVisible: true});
  }

  openCreateProcessDialog() {
    this.setState({createProcessDialogVisible: true});
  }

  closeCreateProcessDialog() {
    this.setState({createProcessDialogVisible: false});
  }
  handleCloseCreateProcessDialog() {
    this.closeCreateProcessDialog();
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleCreateProcess(process) {
    let {processes = {}, translateX, translateY} = this.state;
    const {name, comment} = process;
    const id = Date.now(); // TODO replace with actual UUID
    this.createTag(name).then(newTagId => {
      processes = {
        [id]: {
          name,
          comment,
          id,
          tagId: newTagId,
          x: 150 - translateX, // create Node next to Toolbar
          y: 100 - translateY, //
          type: 'process',
        },
        ...processes,
      };

      this.closeCreateProcessDialog();

      this.setState(() => ({
        processes,
      }));
      this.saveMaps({processes});
    });
  }

  createTag(name) {
    const {gmp} = this.props;
    return gmp.tag
      .create({
        active: '1',
        name,
        resource_type: 'host',
      })
      .then(response => {
        const {data = {}} = response;
        return data.id;
      });
  }

  handleProcessChange(newProcess) {
    const {processes} = this.state;
    const {id} = newProcess;
    const oldProcess = processes[id];

    processes[id] = {...oldProcess, ...newProcess};

    this.closeCreateProcessDialog();

    this.selectedElement = processes[id];

    this.setState(() => ({
      processes,
    }));
    this.saveMaps({processes});
  }

  handleDrawEdge() {
    this.setState({isDrawingEdge: true});
  }

  handleCreateEdge(source, target) {
    let {edges = {}} = this.state;
    const id = Date.now();
    edges = {
      [id]: {
        source: source.id,
        target: target.id,
        id,
        type: 'edge',
      },
      ...edges,
    };
    this.selectedElement = edges[id];
    this.setState(() => ({
      edges,
      isDrawingEdge: false,
      edgeDrawSource: undefined,
      edgeDrawTarget: undefined,
    }));
    this.saveMaps({edges});
  }

  handleSelectElement(event, element) {
    event.stopPropagation();
    const {isDrawingEdge, edgeDrawSource, edgeDrawTarget} = this.state;

    if (isDrawingEdge) {
      if (element.type === 'process' && !isDefined(edgeDrawSource)) {
        this.draggingElement = undefined;
        this.selectedElement = element;

        this.setState({edgeDrawSource: element});
      } else if (element.type === 'process' && !isDefined(edgeDrawTarget)) {
        this.setState({edgeDrawTarget: element});
      }
    }
    this.props.onSelectElement(element);
    this.selectedElement = element;
    this.draggingElement = element;
  }

  handleMouseDown(event) {
    this.coords = {
      x: event.pageX,
      y: event.pageY,
    };
    this.selectedElement = undefined;
    this.setState({
      isDraggingBackground: true,
      isDrawingEdge: false,
      edgeDrawSource: undefined,
      edgeDrawTarget: undefined,
    });
  }

  handleMouseUp(event) {
    if (isDefined(this.draggingElement)) {
      this.draggingElement.dx = undefined;
      this.draggingElement.dy = undefined;
      this.draggingElement = undefined;
    }
    this.coords = {};
    if (this.state.isDraggingProcess) {
      // if dragging just stopped
      this.saveMaps({});
    }
    this.setState({isDraggingBackground: false, isDraggingProcess: false});
  }

  handleMouseMove(event) {
    if (
      isDefined(this.draggingElement) &&
      this.draggingElement.type !== 'edge'
    ) {
      // we are dragging an element
      const {x: mx, y: my} = this.getMousePosition(event);
      const {x, y} = this.toBackgroundCoords(mx, my);
      this.draggingElement.x = x;
      this.draggingElement.y = y;
      this.setState({isDraggingProcess: true});
      return;
    }

    if (!this.state.isDraggingBackground) {
      // we aren't dragging anything
      return;
    }

    event.preventDefault();

    const xDiff = this.coords.x - event.pageX;
    const yDiff = this.coords.y - event.pageY;

    this.coords.x = event.pageX;
    this.coords.y = event.pageY;

    this.setState(state => ({
      translateX: state.translateX - xDiff,
      translateY: state.translateY - yDiff,
    }));
  }

  toBackgroundCoords = (x, y) => {
    const {translateX, translateY} = this.state;
    return {
      x: x - translateX,
      y: y - translateY,
    };
  };

  getCoordinates = processId => {
    const {processes} = this.state;
    const processNode = processes[processId];
    return {x: processNode.x, y: processNode.y};
  };

  render() {
    const {
      createProcessDialogVisible,
      edges = {},
      isDraggingBackground,
      isDraggingProcess,
      isDrawingEdge,
      processes = {},
      translateX,
      translateY,
    } = this.state;
    const cursorType = isDraggingBackground ? 'move' : 'default';
    const processCursorType = isDraggingProcess ? 'move' : 'grab';

    return (
      <ErrorBoundary>
        <Wrapper>
          <Map
            ref={this.svg}
            cursor={cursorType}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onMouseMove={this.handleMouseMove}
          >
            <Background
              color={isDrawingEdge ? 'orange' : undefined}
              ref={this.backgroundRef}
            />
            <Group left={translateX} top={translateY}>
              {Object.keys(edges).map(key => {
                const isSelected = edges[key] === this.selectedElement;
                const {id} = edges[key];
                const source = this.getCoordinates(edges[key].source);
                const target = this.getCoordinates(edges[key].target);
                return (
                  <Edge
                    isSelected={isSelected}
                    key={id}
                    source={source}
                    target={target}
                    id={id}
                    onMouseDown={event =>
                      this.handleSelectElement(event, edges[key])
                    }
                  />
                );
              })}
              {Object.keys(processes).map(key => {
                const {
                  color,
                  comment,
                  derivedSeverity,
                  id,
                  name,
                  severity,
                  x,
                  y,
                } = processes[key];
                const isSelected = processes[key] === this.selectedElement;
                return (
                  <ProcessNode
                    color={color}
                    comment={comment}
                    cursor={processCursorType}
                    derivedSeverity={derivedSeverity}
                    id={id}
                    isSelected={isSelected}
                    key={id}
                    name={name}
                    radius={DEFAULT_PROCESS_SIZE}
                    severity={severity}
                    x={x}
                    y={y}
                    onMouseDown={event =>
                      this.handleSelectElement(event, processes[key])
                    }
                  />
                );
              })}
            </Group>
          </Map>
          <Tools
            applyConditionalColorization={
              this.props.applyConditionalColorization
            }
            drawIsActive={isDrawingEdge}
            onCreateProcessClick={this.handleOpenCreateProcessDialog}
            onDrawEdgeClick={this.handleDrawEdge}
            onDeleteClick={this.handleDeleteElement}
            onToggleConditionalColorization={
              this.props.onToggleConditionalColorization
            }
          />
          <ProcessPanel
            element={this.selectedElement}
            hostList={this.selectedElement ? this.props.hostList : undefined}
            onEditProcessClick={this.openCreateProcessDialog}
            onProcessChange={this.handleProcessChange}
          />
        </Wrapper>
        {createProcessDialogVisible && (
          <CreateProcessDialog
            comment={
              isDefined(this.selectedElement)
                ? this.selectedElement.comment
                : undefined
            }
            name={
              isDefined(this.selectedElement)
                ? this.selectedElement.name
                : undefined
            }
            id={
              isDefined(this.selectedElement)
                ? this.selectedElement.id
                : undefined
            }
            onChange={this.handleValueChange}
            onClose={this.handleCloseCreateProcessDialog}
            onCreate={this.handleCreateProcess}
            onEdit={this.handleProcessChange}
          />
        )}
      </ErrorBoundary>
    );
  }
}

const mapStateToProps = (rootState, {hostFilter}) => {
  const hostSel = hostSelector(rootState);
  return {
    hostList: hostSel.getEntities(hostFilter),
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    saveUpdatedMaps: updatedMaps =>
      dispatch(saveBusinessProcessMap(gmp)(updatedMaps)),
  };
};

ProcessMap.propTypes = {
  applyConditionalColorization: PropTypes.bool,
  gmp: PropTypes.gmp.isRequired,
  hostList: PropTypes.array,
  mapId: PropTypes.id, // isRequired
  processMaps: PropTypes.object,
  saveUpdatedMaps: PropTypes.func.isRequired,
  onSelectElement: PropTypes.func.isRequired,
  onToggleConditionalColorization: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(ProcessMap);

// vim: set ts=2 sw=2 tw=80:
