import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {fbAuth} from '../Provider/Firebase';
import {Nav, Navbar, NavItem} from 'react-bootstrap';

class Navigation extends Component {
    render(){
        return (
            <Navbar inverse collapseOnSelect fixedTop>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="/">Utr <i class="fas fa-bolt"></i> Ekg</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <li>
                            <Link to={'/private/list'}>
                                <i class="fas fa-list-ol"></i> Resultados
                            </Link>
                        </li>
                        <li>
                            <Link to={'/private/detail'}>
                                <i class="far fa-user"></i> Nuevo paciente
                            </Link>
                        </li>
                    </Nav>
                    <Nav pullRight>
                        <NavItem href="#">
                            <span class="text-info">{fbAuth.currentUser.email}</span>
                        </NavItem>
                        <NavItem onClick={this.closeSession}>
                            <span class="text-danger"><i class="fas fa-sign-out-alt"></i> Salir</span>
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }

    closeSession() {
        fbAuth.signOut();
        window.location = "/";
    }
}
/*
            <nav className={"navbar navbar-inverse navbar-fixed-top"}>
                <div class={"container"}>
                    <div class="navbar-header"> 
                        <button type="button" class="collapsed navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-6" aria-expanded="false"> 
                            <span class="sr-only">Menu</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> 
                        </button> 
                        <a href="/" class="navbar-brand">Utr <i class="fas fa-bolt"></i> Ekg</a> 
                    </div>
                    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-6"> 
                        <ul className={"nav navbar-nav navbar-left"}>
                            <li>
                                <Link to={'/private/list'}>
                                    <i class="fas fa-list-ol"></i> Resultados
                                </Link>
                            </li>
                            <li>
                                <Link to={'/private/detail'}>
                                    <i class="far fa-user"></i> Nuevo paciente
                                </Link>
                            </li>
                        </ul>
                        <ul class="nav navbar-nav navbar-right"> 
                            <li> <button className="btn btn-link">{fbAuth.currentUser.email}</button></li> 
                            {
                                //<li class="dropdown"> <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                            }
                            <li> <button className="btn btn-link" onClick={this.closeSession}><i class="fas fa-sign-out-alt"></i> Salir</button></li> 
                        </ul>
                    </div>
                </div>
            </nav>
            */

export default Navigation;
    