import React, { Component } from 'react';
import { Glyphicon, Alert } from 'react-bootstrap';
import './Auth.css';
import { Redirect } from 'react-router-dom';

class AuthPage extends Component {
  constructor(props) {
    super(props);
    this.state = {email: '', password:'', logged: false, checked: false, mounted: false, message: {txt: "", type: ""}};
    this.handleLogin = this.handleLogin.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
  }

  componentDidMount() {
    this.props.fb.auth().onAuthStateChanged(authUser => {
      if(this.refs.containerRef) {
        this.setState({checked: true, mounted: true, logged: authUser !== null})
      }
    });
  }

  handleLogin() {
    this.setState({message: {txt: "Comprobando...", type: "info"}}, () => {
      this.props.fb.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(res => {
        if(res){
          //res.getToken().then(token => console.log(token));
          this.setState({logged: true, message: {txt: "", type: ""}});
        }
      })
      .catch(ex => {
        this.setState({message: {txt: "Error de usuario, compruebe su usuario y contraseña", type: "danger"}});
      });
    });
  }

  handleChangeEmail(event) {
    this.setState({email: event.target.value});
  }

  handleChangePassword(event) {
    this.setState({password: event.target.value});
  }

  render() {
    return !this.state.logged ? (
        <div className="container" ref="containerRef">
          <div className="row login-form">
            {!this.state.checked ? (
                <div className="col-12 text-center loading"><Glyphicon glyph="refresh" /> Cargando...</div>) : 
              (
                <div className="col-xs-12 col-sm-10 col-sm-offset-1 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">
                  <div className="login-title">Utr <i className="fas fa-bolt"></i> Ekg</div>
                  {(this.state.message.txt !== "") && (<Alert bsStyle={this.state.message.type}>{this.state.message.txt}</Alert>)}
                  <div className="input-group">
                    <span className="input-group-addon"><Glyphicon glyph="envelope" /></span>
                    <input type="email" value={this.state.email} onChange={this.handleChangeEmail} className="form-control"/>
                  </div>
                  <div className="input-group" id="input-group-password">
                    <span className="input-group-addon"><Glyphicon glyph="lock" /></span>
                    <input type="password" value={this.state.password} onChange={this.handleChangePassword} className="form-control" />
                  </div>
                  <div className="text-center"> 
                    <button className="btn btn-primary submit" onClick={this.handleLogin}>Entrar</button>
                  </div>
                </div>
              )
            }
          </div>
        </div>
        ) : (
          <Redirect to={{ pathname: '/private/home' }} />
        );
  }
}

export default AuthPage;
