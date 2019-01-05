import React from 'react';
import style from './Vnodes.css'
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

export class NodeFrame extends React.Component {
    /* 
    CLASS DESC:

    This class is the container class for all nodes within the definition
    of a program in vlisp.
    */

    constructor(props){
      /*
      (ReactProperties)->NodeFrame

      This constructor makes a NodeFrame with the styling.  It uses
      the onBoard Property to check whether or not to position
      relative or absolute to the parent DOM property.  This is
      because user defined positions are absolute while the positioning
      of the NodeFrame in the symbol spawner are relative to one another.
      */

      super(props);
      this.style = {
        height: 100,
        width: 200,
        backgroundColor: 'blue'
      };

      if(props.onBoard){
        this.style = { ...this.style, position: 'absolute'};
      } else {
        this.style = { ...this.style, position: 'relative'};
      }
      
      this.state = {
        top: props.top,
        left: props.left
      };
      
    }
    
    onDragStart(event){
      /*
      (reactSyntheticEvent)
      
      This procedure serves to correctly set the
      offset from the top left corner of the div being dragged and
      dropped.  This is done by calculating the difference between the 
      mouse and the top left of the div.
      */

      this.setState({
        NodeFrameMouseOffset: {
          top: event.pageY - event.target.offsetTop,
          left: event.pageX - event.target.offsetLeft
        }
      });
    }
    
    onDragEnd(event){
      /*
      (reactSyntheticEvent)

      This procedure has two different behaviors:
      The first behavior is when an onBoard NodeFrame is dragged
      and Dropped.  This function uses the delta calculated
      in onDragStart to correctly place the NodeFrame in its new
      location.  The second behavior is when the NodeFrame is being
      dragged and dropped from the SymbolSpawner in which case
      the new symbol is placed on the board where the user chooses
      to place it.  This is done with a referenced call to addNodeFrame
      in the Board component.
      */


      const { NodeFrameMouseOffset: { top, left } } = this.state;

      let coords = {
        top: event.pageY - top,
        left: event.pageX - left
      }

      if(this.props.onBoard){
        this.setState({
            top: event.pageY - top,
            left: event.pageX - left
        }, () => this.props.setUpdate(this.props.id));
      } else {
          this.props.onBoardDrop(coords, this.props.type);
      }
    }

    render(){
      /*
      RENDER DESC:
    
      This render determines once again if the component is
      on the SymbolSpawner or on the borad.  If it is on the Board
      it sets the position to whatever is stored within the state. 
      However it sets the the style of the component without position
      if the component resides within the Symbol Spawner.  
      */

      var style;
      var getInputFunc;
      var getOutputFunc;
      const { top, left } = this.state;
      const { getInput = () => {}, getOutput = () => {}, id } = this.props;
      if(this.props.onBoard){
        style = { ...this.style, top, left };
      } else {
        style = this.style;
      }
      const Tag = this.props.type;

      return (<div className='NodeFrame'
                   onDragStart={this.onDragStart.bind(this)}
                   onDragEnd={this.onDragEnd.bind(this)}
                   draggable
                   style={ style }
                   id = {`nodeFrame_${id}`}>
              <Tag idProxy={ id } getInput = {getInput} getOutput = {getOutput}/>
              </div>);
    }
}

class VariableNode extends React.Component {
    /*
    CLASS DESC:
    
    This class defines the UI for a NodeFrame containing
    a User defined variable.  The UI contains two inputs
    one containing the name of the variable and another containing
    its initial value.

    //TODO allow users to optionally define an initial value
    */

    constructor(props){
      /*
      (ReactProperties)->VariableNode

      This constructor simply sets the state 
      of both inputs to empty strings.
      */

      super(props);
      this.state ={
        name: "",
        val: ""
      }
     
    }
    
    onInputChange(stateName, event){
      /*
      (String, ReactSyntheticEvent)

      This procedure uses binding to set the state of an
      input within the variable.  The state is populated
      by the event.target.value field of the event.
      */

      this.setState({ [stateName]: event.target.value });
    }
    
    render(){
      /*
      RENDER DESC:

      This render function binds the two different versions
      of onInputChange such that each input is set properly
      set upon an input change.
      */

      const {name, val}= this.state;
      const inlineStyle = {position: 'relative'}
      const { getInput = () => {}, getOutput = () => {}, idProxy} = this.props;
      
      return <div style= { inlineStyle }>
        <h1>var</h1>
        <label >name</label>
        <input type = "text" value={ name } onChange={ this.onInputChange.bind(this, 'name')  } />
        <label>value</label>
        <input type = "text" value={ val } onChange={ this.onInputChange.bind(this, 'val')  }/>
        <ConnectorRow>
          <InputConnector  id = {`input_${idProxy}_0`} getId = {getInput}/>
          <OutputConnector id = {`output_${idProxy}_0`} getId = {getOutput}/>
        </ConnectorRow>
      </div>
    }
}
  
  
class ConstNode extends React.Component {
    /*
    CLASS DESC:

    This class is a derivative of the VariableNode class
    the most notable difference is that this class only has
    one input field for the value.  See VariableNode documentation
    for operation of methods.
    */

    constructor(props){
      super(props);
      this.state ={
        name: ""
      }
     
    }
    
    onInputChange(stateName, event){
      this.setState({ [stateName]: event.target.value });
    }
    
    render(){
      const {name, val}= this.state;
      const inlineStyle = {position: 'relative'}
      const { getInput = () => {}, getOutput = () => {}, idProxy} = this.props;
      
      return <div style = { inlineStyle }>
        <h1>const</h1>
        <label>value</label>
        <input type = "text" value={ val } onChange={ this.onInputChange.bind(this, 'val') }/>
        <ConnectorRow>
          <OutputConnector id = {`output_${ idProxy }_0`} getId = { getOutput }/>
        </ConnectorRow>
      </div>
    }
}

class BinopNode extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    let name = this.props.binopName;
    const { getInput = () => {}, getOutput = () => {}, idProxy} = this.props;

    return (
      <div> 
        <h1>{ name }</h1>
        <ConnectorRow>
          <InputConnector id = {`input_${idProxy}_0`} getId = {getInput}/>
          <OutputConnector id = {`output_${idProxy}_0`} getId = {getOutput}/>
        </ConnectorRow>
        <ConnectorRow>
          <InputConnector id = {`input_${idProxy}_1`} getId = {getInput}/>
        </ConnectorRow>
      </div>
    );
  }
}

class AddNode extends React.Component{
  constructor(props){
    super(props);
  }
  
  render(){
    const { getInput = () => {}, getOutput = () => {}, idProxy} = this.props;

    return (<BinopNode binopName={'add'} getInput = {getInput} getOutput = {getOutput} idProxy = {idProxy}/>);
  }
}

class SubNode extends React.Component{
  constructor(props){
    super(props);
  }
  
  render(){
    const { getInput = () => {}, getOutput = () => {}, idProxy} = this.props;

    return (<BinopNode binopName={'subtract'} getInput = {getInput} getOutput = {getOutput} idProxy = {idProxy}/>);
  }
}

class MulNode extends React.Component{
  constructor(props){
    super(props);
  }
  
  render(){
    const { getInput = () => {}, getOutput = () => {}, idProxy} = this.props;

    return (<BinopNode binopName={'multiply'} getInput = {getInput} getOutput = {getOutput} idProxy = {idProxy}/>);
  }
}

class IntDivNode extends React.Component{
  constructor(props){
    super(props);
  }
  
  render(){
    const { getInput = () => {}, getOutput = () => {}, idProxy} = this.props;

    return (<BinopNode binopName={'Integer Divide'} getInput = {getInput} getOutput = {getOutput} idProxy = {idProxy}/>);
  }
}

class ModuloNode extends React.Component{
  constructor(props){
    super(props);
  }
  
  render(){
    const { getInput = () => {}, getOutput = () => {}, idProxy} = this.props;

    return (<BinopNode binopName={'Modulo'} getInput = {getInput} getOutput = {getOutput} idProxy = {idProxy}/>);
  }
}

  
export class SymbolSpawner extends React.Component {
    constructor(props){
      /*
      (ReactProperties)->SymbolSpawner

      This constructor simply calls the 
      super and returns.
      */

      super(props);
    }
    
     render(){ 
       /*
       RENDER DESC:
       
       This render handles the creation of two prototype .  Each one
       containing either a generic variable or a generic constant.  The 
       onBoardDrop method binding addNodeFrame (see Home.js) as onBoardDrop
       also resides in the instantiation of the .
       */

       return(<div className={style.SymbolSpawner}>
         <NodeFrame name="genericVar" type={VariableNode} onBoard={false} onBoardDrop={this.props.onBoardDrop} />
         <NodeFrame name="GenericConst" type={ConstNode} onBoard={false} onBoardDrop={this.props.onBoardDrop} />
         <NodeFrame name="GenericAdd" type={AddNode} onBoard={false} onBoardDrop={this.props.onBoardDrop} />
         <NodeFrame name="GenericSub" type={SubNode} onBoard={false} onBoardDrop={this.props.onBoardDrop} />
         <NodeFrame name="GenericMul" type={MulNode} onBoard={false} onBoardDrop={this.props.onBoardDrop} />
         <NodeFrame name="GenericIntDiv" type={IntDivNode} onBoard={false} onBoardDrop={this.props.onBoardDrop} />
         <NodeFrame name="GenericModulo" type={ModuloNode} onBoard={false} onBoardDrop={this.props.onBoardDrop} />
         </div>);
     }
}

class OutputConnector extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      top: 0,
      left: 90 + '%'
    }
  }

  onClick(e){
    console.log("click ping!");
    this.props.getId(this.props.id);
  }

  render(){
    const { id } = this.props;
    const { top, left } = this.state;
    const inlineStyle = {
      top,
      left
    };

    return(<div className={style.outputConnector} id={id} style={inlineStyle} onClick={this.onClick.bind(this)}></div>)
  }
}

class InputConnector extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      top: 0,
      left: 0
    }
  }

  onClick(e){
    console.log("click ping!");
    this.props.getId(this.props.id);
  }

  render(){
    const { id } = this.props;
    const { top, left } = this.state;
    const inlineStyle = {
      top,
      left
    }

    return(<div className={style.inputConnector} id = {id} style={inlineStyle} onClick = {this.onClick.bind(this)}></div>)
  }
}

class ConnectorRow extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return(<div className={style.ConnectorRow}>{this.props.children}</div>)
  }
}

export class Connector extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      top: 0,
      left: 0,
      height: 0,
      width: 0,
      centerLineStyle: null,
      endLineStyle: null
    }
  }

  makeConnector(inputID, outputID){
    const start  = document.getElementById(outputID);
    const end = document.getElementById(inputID);

    const startBox = start.parentElement.getBoundingClientRect();
    const endBox = end.parentElement.getBoundingClientRect();

    const startPoint = start.getBoundingClientRect();
    const endPoint = end.getBoundingClientRect();

    const startBoxIsHigher = startBox.top > endBox.top;
    const connectorTop = startBoxIsHigher ? startBox : endBox;
    const connectorBottom = connectorTop === startBox ? endBox : startBox;
    const borderWidth = 4;

    var top = connectorTop.top;
    const height = top - connectorBottom.bottom + borderWidth + (startPoint.height / 2);
    const left = startPoint.right;
    const width = endPoint.left - left;

    console.log("State before set: ", this.state);
    console.log("current rects:");

    console.log("start box: ", startBox);
    console.log("end box: ", endBox);
    
    this.setState({
      top: (top - height), left, height: (height + (endPoint.height /2)), width,
      startLineStyle: {
        alignSelf: startBoxIsHigher ? 'flex-end' : 'flex-start' 
      },
      centerLineStyle: {
        height: height + 5
      },
      endLineStyle: {
        alignSelf: startBoxIsHigher ? 'flex-start' : 'flex-end' 
      }
    },() => console.log("in makeConnector: ", this.state, inputID, outputID));
  }

  componentDidMount(){
    this.makeConnector(this.props.IDs.inputID, this.props.IDs.outputID);
  }

  componentWillReceiveProps(newProps){
    if(!!newProps.IDs.needsUpdate && newProps.IDs.needsUpdate){ 
      this.makeConnector(newProps.IDs.inputID, newProps.IDs.outputID);
      //this.props.endUpdate();
    }
  }

  render(){
    console.log("render called");
    const { top, left, height, width, startLineStyle,
      centerLineStyle, endLineStyle } = this.state;

    return (<div  className={style.connector} style = { {top, left, height, width} }>
      <div className={style.startLine} style = {startLineStyle}></div>
      <div className={style.centerLine} style = {centerLineStyle}></div>
      <div className={style.endLine} style = {endLineStyle}></div>
    </div>);
  } 
}