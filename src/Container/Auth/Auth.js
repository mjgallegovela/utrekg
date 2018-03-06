import React, { Component } from 'react';
import './Auth.css';
import { fbAuth } from '../../Provider/Firebase';


class AuthPage extends Component {
  constructor(props) {
    super(props);
    this.state = {email: '', password:''};
    this.handleLogin = this.handleLogin.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
  }

  handleLogin() {
    fbAuth.signInWithEmailAndPassword(this.state.email, this.state.password)
    .then(res => {
      if(res){
        res.getToken().then(token => console.log(token));
        this.props.history.push('/private/home');
      }
    })
    .catch(ex => {
      console.log("Errorrrr")
    });
  }

  handleChangeEmail(event) {
    this.setState({email: event.target.value});
  }

  handleChangePassword(event) {
    this.setState({password: event.target.value});
  }

  render() {
    return (
      <div className="container">
        <div className="row login-form">
          <div className="col-12 col-sm-10 col-sm-offset-1 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">
            <div className="login-title">Utr <i className="fas fa-bolt"></i> Ekg</div>
            <div className="input-group">
              <span className="input-group-addon"><i className="glyphicon glyphicon-envelope"></i></span>
              <input type="email" value={this.state.email} onChange={this.handleChangeEmail} className="form-control"/>
            </div>
            <div className="input-group" id="input-group-password">
              <span className="input-group-addon"><i className="glyphicon glyphicon-lock"></i></span>
              <input type="password" value={this.state.password} onChange={this.handleChangePassword} className="form-control" />
            </div>
            <div className="text-center"> 
              <button className="btn btn-primary submit" onClick={this.handleLogin}>Entrar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AuthPage;
