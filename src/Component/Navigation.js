import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Nav, Navbar, NavItem} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';

class Navigation extends Component {
    constructor(props) {
        super(props);
        this.closeSession = this.closeSession.bind(this);
    }
    render(){
        return (
            <Navbar inverse collapseOnSelect fixedTop>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to={"/private/home"} >Utr <i className="fas fa-bolt"></i> Ekg</Link>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <LinkContainer to="/private/list">
                            <NavItem><i className="fas fa-list-ol"></i> Resultados</NavItem>
                        </LinkContainer>
                        <LinkContainer to='/private/newUser'>
                            <NavItem><i className="far fa-user"></i> Nuevo paciente</NavItem>
                        </LinkContainer>
                    </Nav>
                    <Nav pullRight>
                        <NavItem>
                            <span className="text-info">{this.props.fb.auth().currentUser.email}</span>
                        </NavItem>
                        <NavItem onClick={this.closeSession}>
                            <span className="text-danger"><i className="fas fa-sign-out-alt"></i> Salir</span>
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }

    closeSession() {
        this.props.fb.auth().signOut();
        window.location = "/";
    }
}

export default Navigation;
    