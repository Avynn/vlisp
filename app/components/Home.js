import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';
import { NodeFrame, SymbolSpawner, Connector } from './Vnodes';
const ipcRenderer = require('electron');

type Props = {};

export default class Board extends Component {
  /*
  CLASS DESC:

  This class is used by the user to create programs.  The board
  contains both the SymbolSpawner as well as any subsequent features
  to be added to this program.  NodeFrames (see VNode.js) within the Board
  function as the symbol table for the compiler.

  //TODO: -save board to some sort of DB
  */


  constructor(props){
    /*
    (ReactProperties)->Board

    This function creates the boards datafields.
    The state contains a list of the NodeFrames on the board
    each NodeFrame is either an operation or a Symbol.  This compiler
    uses the Symbol Table as part of the AST.  In this case the
    NodeFrame field is initted as empty.  Only one method is bound here
    allowing for the Symbol spawner to add NodeFrames to the Board.
    */

    super(props);
    
    this.state = {
      NodeFrames: [],
      connectors: []
    };
    
    this.addNodeFrame.bind(this);
    this.getType.bind(this);
  }

  componentDidMount(){
    this.props.renderer.on('saveGraph', this.saveBoard.bind(this));
    this.props.renderer.on('loadGraph', this.loadBoard.bind(this));
  }
  
  onDragOver(event){
    /*
    (ReactSyntheticEvent)

    This method prevents the default
    behavior of the superclasses' onDragOver
    method.

    //TODO find out why I need this.
    */

    event.preventDefault();
  }
  
  addNodeFrame(coords, type){
    /*
    (coords(CustomDefined ES6 object), ES6 Class Definition Reference)

    This function updates the state to add a NodeFrame to the board.  This is done
    by initializing a new ES6 object defining the attributes of the NodeFrame to the board.
    It then uses an appending method to copy the current NodeFrame array and append the new
    NodeFrame to the end of the array residing in the state.
    */

    let newNodeFrame = {NodeFrameName: this.state.NodeFrames.length.toString(),
                  NodeFrameTypeName: type.name,
                  NodeFrameType: type,
                  coords: coords}

    this.setState({
      NodeFrames: [ ...this.state.NodeFrames, newNodeFrame]
    })
  }

  getOutputConnector(id){
    const lastObj = this.state.connectors.pop() || {};
    if(!lastObj.outputID){
      lastObj.outputID = id;

      this.setState({
        connectors: [ ...this.state.connectors, lastObj ]
      });
    } else if(!!lastObj.outputID && !!lastObj.inputID){
      this.setState({
        connectors: [ ...this.state.connectors, lastObj, {outputID: id}]
      })
    }
  }

  getInputConnector(id){
    const lastObj = this.state.connectors.pop() || {};
    if(!lastObj.inputID){
      lastObj.inputID = id;

      this.setState({
        connectors: [ ...this.state.connectors, lastObj ]
      });
    } else if(!!lastObj.outputID && !!lastObj.inputID){
      this.setState({
        connectors: [ ...this.state.connectors, lastObj, {inputID: id}]
      })
    }
  }

  updateConnectors(nodeFrameID){
    const newConnectors = this.state.connectors.map((connector) => {
      if(connector.inputID.split('_')[1] === nodeFrameID.toString() || connector.outputID.split('_')[1] === nodeFrameID.toString()){
        connector.needsUpdate = true;
      }

      return connector;
    });

    this.setState({
      connectors: newConnectors
    }, () => console.log("board update"));
  }

  endConnectorsUpdate(){
    const hasUpdate = this.state.connectors.filter((connector) => {
      if(connector.needsUpdate){
        connector.needsUpdate = false;
      }
    });
  }

  saveBoard(){
    this.props.renderer.send('sendMainGraph', this.state);
  }

  loadBoard(event, graph){

    graph.NodeFrames.forEach((nodeFrame) => {
    })

    //this.getType();

    console.log(SymbolSpawner);

    //this.setState(graph);
  }

  getType(){
    console.log(this.props);
  }

  
  render(){
    /*
    RENDER DESC:

    This render creates the board according to the user definition of 
    NodeFrame components.  It first extracts the NodeFrames array form the state of board.
    It then binds onDragOver as well as mapping all NodeFrame attributes to NodeFrame objects
    on the board.
    */

    const { NodeFrames, connectors } = this.state;

    return (
      <div className={styles.Board}
           onDragOver={ (e) => this.onDragOver(e)}>
          { NodeFrames.map((NodeFrameAttr, i) => <NodeFrame key={i} 
                                           id  = {i}
                                           name={NodeFrameAttr.NodeFrameName} 
                                           type={NodeFrameAttr.NodeFrameType} 
                                           onBoard={true} 
                                           top={NodeFrameAttr.coords.top} 
                                           left={NodeFrameAttr.coords.left}
                                           getInput={this.getInputConnector.bind(this)}
                                           getOutput={this.getOutputConnector.bind(this)}
                                           setUpdate={this.updateConnectors.bind(this)}></NodeFrame>) }
          { connectors.map( (connector, i) => {
            if(connector.inputID && connector.outputID){
              return (<Connector key={i} IDs={connector} needsUpdate = {connector.needsUpdate} endUpdate = {this.endConnectorsUpdate.bind(this)}/>);
            }
          }) }
          <SymbolSpawner onBoardDrop={this.addNodeFrame.bind(this)} />
      </div>
    );
  }
}
