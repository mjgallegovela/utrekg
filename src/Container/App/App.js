import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import PrivateRoute from '../../Component/PrivateRoute';

import HomePage from '../Home/Home';
import AuthPage from '../Auth/Auth';
import Fb from '../../Provider/Firebase';

import './App.css';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {fb: Fb}
  }

  componentDidMount() {
    Fb.auth().onAuthStateChanged(authUser => {
      authUser
        ? this.setState(() => ({ authUser }))
        : this.setState(() => ({ authUser: null }));
    });
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route path="/auth/login" exact render={() => {
              return (<AuthPage fb={this.state.fb} />);
            }}/>
            <PrivateRoute path="/private/:page/:id?" fb={this.state.fb} component={HomePage}  exact />
            <PrivateRoute path="/" fb={this.state.fb} render={() => {
              return (
                <Redirect
                  to={{
                    pathname: '/private/home'
                  }}
                />
              );
            }}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
