import React from 'react';
import './Detail.css';
import {FormGroup, ControlLabel, FormControl, HelpBlock, Button} from 'react-bootstrap';
import Result from '../../Model/result';
import { fbFirestore } from '../../Provider/Firebase';

function FieldGroup({ id, label, help, ...props }) {
    return (
      <FormGroup controlId={id}>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
        {help && <HelpBlock>{help}</HelpBlock>}
      </FormGroup>
    );
  }

export default class Detail extends React.Component {
    constructor(props) {
        super(props);
        var result = new Result();
        this.state = {result: result};
        this.inputs = {};
        this.save = this.save.bind(this);
    }

    save() {
        let newState = this.state.result;
        for(var key in this.inputs) {
            newState[key] = this.inputs[key].value;
        }
        this.setState({result: newState});
        if(this.state.id !== null ){
            var result = {};
            for(var key in this.state.result) {
                result[key] = this.state.result[key];
            }
            fbFirestore.collection("results").add(result)
            .then(function(docRef) {
                console.log("Document written with ID: ", docRef.id);
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
        }
    }

    render() {
        const result = (
            <div className='row'>
                <div className="col-12 col-sm-12 col-md-6 col-lg-4">
                    <FieldGroup
                        id="formControlsText"
                        type="text"
                        label="Nombre"
                        placeholder="Nombre del usuario"
                        inputRef={ref => { this.inputs.nombre = ref; }}
                        />
                </div>
                <div className="col-12 col-sm-12 col-md-6 col-lg-4">
                    <FieldGroup
                        id="formControlsText"
                        type="text"
                        label="Primer apellido"
                        placeholder="Primer apellido"
                        inputRef={ref => { this.inputs.apellido1 = ref; }}
                        />
                </div>
                <div className="col-12 col-sm-12 col-md-offset-6 col-md-6 col-lg-4 col-lg-offset-0">
                    <FieldGroup
                        id="formControlsText"
                        type="text"
                        label="Segundo apellido"
                        placeholder="Segundo apellido"
                        inputRef={ref => { this.inputs.apellido2 = ref; }}
                        />
                </div>
                <div className="col-12 col-sm-12 col-md-offset-6 col-md-6 col-lg-4">
                <Button bsStyle="success" onClick={this.save}>Success</Button>
                </div>
            </div>
        );
        return result;
    }
}