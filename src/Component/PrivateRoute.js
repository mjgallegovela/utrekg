/**
 *
 * PrivateRoute
 * Higher Order Component that blocks navigation when the user is not logged in
 * and redirect the user to login page
 *
 * Wrap your protected routes to secure your container
 */

import React from 'react';
import { Redirect, Route } from 'react-router-dom';

//import { fbAuth } from '../Provider/Firebase';

const PrivateRoute = ({ component: Component, fb: Fb, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      return Fb.auth().currentUser !== null ? (
        <Component fb={Fb} {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/auth/login'
          }}
        />
      )
    }
  }
  />
);

export default PrivateRoute;
