import React, { Component } from 'react';
import Board from '../components/Home';
const {ipcRenderer} = require('electron');


export default class HomePage extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return <Board renderer={ipcRenderer}/>;
  }
}
