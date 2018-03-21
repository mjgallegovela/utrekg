import React from 'react';
import {Button, Modal} from 'react-bootstrap';
import './CustomModal.css';

export default class Detail extends React.Component {
    render() {
        return (
            <div className="static-modal">
                <Modal className={"modal-" + this.props.message.type} show={this.props.message.txt !== ""} 
                        onHide={this.handleCloseModal}>
                    <Modal.Body>
                        {this.props.message.txt}
                    </Modal.Body>
                    {this.props.message.showClose && (
                    <Modal.Footer>
                        <Button bsStyle={this.props.message.type} onClick={this.props.handleCloseModal}>Aceptar</Button>
                    </Modal.Footer>
                    )}
                </Modal>
            </div>
        );
    }
}