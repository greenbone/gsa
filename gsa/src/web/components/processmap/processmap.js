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

import React from 'react';
import styled from 'styled-components';

import {connect} from 'react-redux';

import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import Group from 'web/components/chart/group';
import ErrorBoundary from 'web/components/error/errorboundary';

// import {loadEntities} from 'web/store/entities/hosts';
import {loadBusinessProcessMaps} from 'web/store/usersettings/actions';
import {getBusinessProcessMaps} from 'web/store/usersettings/selectors';

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

    this.props.loadBusinessProcessMaps();
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

  handleDeleteElement() {
    const {id} = this.selectedElement;
    if (isDefined(id)) {
      if (this.selectedElement && this.selectedElement.type === 'edge') {
        const {edges} = this.state;
        const newEdges = this.removeEdge(id, edges);

        this.setState({
          edges: newEdges,
        });
      } else {
        const {edges, processes} = this.state;
        const newProcesses = processes.filter(proc => proc.id !== id);

        const attachedEdges = edges.filter(
          edge => edge.source === id || edge.target === id,
        );

        let newEdges = edges;

        forEach(attachedEdges, edge => {
          newEdges = this.removeEdge(edge.id, newEdges);
        });

        this.setState({
          edges: newEdges,
          processes: newProcesses,
        });
      }
      this.selectedElement = undefined;
    }
  }

  removeEdge(id, edges) {
    const newEdges = edges.filter(edge => edge.id !== id);

    return newEdges;
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
    let {processes, translateX, translateY} = this.state;
    const {name, comment} = process;
    processes = [
      {
        name,
        comment,
        id: Date.now(), // TODO replace with actual UUID
        tagId: '',
        x: 150 - translateX, // create Node next to Toolbar
        y: 100 - translateY, //
        type: 'process',
      },
      ...processes,
    ];

    this.closeCreateProcessDialog();

    this.setState(() => ({
      processes,
    }));
  }

  handleProcessChange(newProcess) {
    // takes the newProcess object and merges it's (possibly reduced number
    // of) values into existing process
    const {processes} = this.state;
    const oldProcessIndex = processes.findIndex(
      proc => proc.id === newProcess.id,
    );
    const oldProcess = processes[oldProcessIndex];
    for (const key in newProcess) {
      oldProcess[key] = newProcess[key];
    }
    processes[oldProcessIndex] = oldProcess;
    this.closeCreateProcessDialog();

    this.setState(() => ({
      processes,
    }));
  }

  handleDrawEdge() {
    this.setState({isDrawingEdge: true});
  }

  handleCreateEdge(source, target) {
    let {edges} = this.state;
    const newEdge = {
      source: source.id,
      target: target.id,
      id: Date.now(),
      type: 'edge',
    };
    edges = [newEdge, ...edges];
    this.selectedElement = newEdge;
    this.setState(() => ({
      edges,
      isDrawingEdge: false,
      edgeDrawSource: undefined,
      edgeDrawTarget: undefined,
    }));
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
    this.setState({isDraggingBackground: false, isDraggingProcess: false});
  }

  handleMouseMove(event) {
    if (isDefined(this.draggingElement)) {
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

    // if (this.state.isDrawingEdge) {
    //   this.renderDrawEdgeNote(event);
    // }

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
    const processNode = processes.find(node => node.id === processId);
    return {x: processNode.x, y: processNode.y};
  };

  render() {
    const {
      createProcessDialogVisible,
      edges = [],
      isDraggingBackground,
      isDraggingProcess,
      isDrawingEdge,
      processes = [],
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
              {edges.map(edge => {
                const isSelected = edge === this.selectedElement;
                const {id} = edge;
                const source = this.getCoordinates(edge.source);
                const target = this.getCoordinates(edge.target);
                return (
                  <Edge
                    isSelected={isSelected}
                    key={id}
                    source={source}
                    target={target}
                    id={id}
                    onMouseDown={event => this.handleSelectElement(event, edge)}
                  />
                );
              })}
              {processes.map(process => {
                const {color, id, comment, name, x, y} = process;
                const isSelected = process === this.selectedElement;
                return (
                  <ProcessNode
                    color={color}
                    comment={comment}
                    cursor={processCursorType}
                    id={id}
                    isSelected={isSelected}
                    key={id}
                    name={name}
                    radius={DEFAULT_PROCESS_SIZE}
                    x={x}
                    y={y}
                    onMouseDown={event =>
                      this.handleSelectElement(event, process)
                    }
                  />
                );
              })}
            </Group>
          </Map>
          <Tools
            drawIsActive={isDrawingEdge}
            onCreateProcessClick={this.handleOpenCreateProcessDialog}
            onDrawEdgeClick={this.handleDrawEdge}
            onDeleteClick={this.handleDeleteElement}
          />
          {isDefined(this.selectedElement) &&
            this.selectedElement.type !== 'edge' && (
              <ProcessPanel
                element={this.selectedElement}
                // hostList={hostList}
                // isLoadingHosts={isLoadingHosts}
                onEditProcessClick={this.openCreateProcessDialog}
                onProcessChange={this.handleProcessChange}
              />
            )}
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

const mapStateToProps = (rootState, {filter}) => {
  return {
    processMaps: getBusinessProcessMaps(rootState)['1'],
    // TODO '1' is an ID that needs to be dynamically changed when >1 maps are loaded
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    // loadHosts: filter => dispatch(loadEntities(gmp)(filter)),
    loadBusinessProcessMaps: () => dispatch(loadBusinessProcessMaps(gmp)()),
  };
};

ProcessMap.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  loadBusinessProcessMaps: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(ProcessMap);

// vim: set ts=2 sw=2 tw=80:
