import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import PrivateRoute from '../../Component/PrivateRoute';

import HomePage from '../Home/Home';
import AuthPage from '../Auth/Auth';

import './App.css';

class App extends Component {

  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route path="/auth/login" component={AuthPage} exact/>
            <PrivateRoute path="/private/:page/:id?" component={HomePage} exact />
            <PrivateRoute path="/" render={() => {
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
