import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import Navigation from '../../Component/Navigation';
import List from '../../Component/List/List';
import Detail from '../../Component/Detail/Detail';

//import logo from './logo.svg';
import './Home.css';

class HomePage extends Component {
  render() {
    return (
      <div className="container">
        <Navigation/>
        {
          (this.props.match.params.page === 'list' || this.props.match.params.page === 'home')? ( 
            <div>
              <div className="pageTitle">
                <h3 className={'teal-text'}>
                  Listado de usuarios
                </h3>
              </div>
              <List />
            </div>
          ) : (this.props.match.params.page === 'detail' 
            && this.props.match.params.id !== undefined) ? (
            <div>
              <div className="pageTitle">
                <h3 className={'teal-text'}>
                  Editar usuario
                </h3>
              </div>
              <Detail exists="true" id={this.props.match.params.id}/>
            </div>
          ) : (
            <div>
              <div className="pageTitle">
                <h3 className={'teal-text'}>
                  Nuevo usuario
                </h3>
              </div>
              <Detail exists="false"/>
            </div>
          )
        }
      </div>
    );
  }
}

export default HomePage;
