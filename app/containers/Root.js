import React, { Component } from 'react';
import Routes from '../Routes';

export default class Root extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <Routes />
    );
  }
}
