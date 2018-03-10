import React from 'react';
import './Detail.css';
import {Checkbox, FormGroup, ControlLabel, Button, Modal, Nav, NavItem} from 'react-bootstrap';
import Result from '../../Model/result';
import { map, size } from 'lodash';
import DatePicker from '../Form/DatePicker';
import FieldGroup from '../Form/FieldGroup';
import SelectFieldGroup from '../Form/SelectFieldGroup';

export default class Detail extends React.Component {
    constructor(props) {
        super(props);
        this.save = this.save.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.resetState = this.resetState.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.refreshComponent = this.refreshComponent.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.state = {
            exists: this.props.exists === 'true',
            loaded: false,
            result: new Result(), 
            id: this.props.id!== undefined? this.props.id: null, 
            message: {txt: "", type: "info", showClose: false},
            tabkey: "1"    
        };
    }

    componentDidMount() {
        console.log("componentDidMount")
        this.refreshComponent();
    }

    componentDidUpdate() {
        console.log("componentDidUpdate")
        this.refreshComponent();
    }

    refreshComponent(){
        if(!this.state.loaded || this.state.exists === (this.props.exists === "true")) {
            this.resetState();
        }
        if(!this.state.loaded) {this.setState({loaded: true}); this.load();}
    }

    load() {
        if(this.state.exists) {
            this.showMessage("Cargando...", "info", false);
            var docRef = this.props.fb.firestore().collection("results").doc(this.props.id);
            var that = this;
            docRef.get().then(function(doc) {
                that.setState({
                    result: doc.data(), 
                    message: {txt: "", type: "info", showClose: false}});
            }).catch(function(error) {
                that.showMessage("Error al cargar el documento, inténtalo de nuevo.", "error", true)
            });
        } else {
            console.log("no exists")
            this.setState({result: new Result()});
        }
    }

    save() {
        this.showMessage("Guardando...", "info", false);
        let currentState = this.state.result;
        var result = {};
        map(currentState, (value, key) => {
            console.log(key + ": " + value);
            result[key] = value;
        });
        this.setState({result: currentState});
        var that = this;
        if(this.props.exists !== "true" ){
            console.log("creando");
            this.props.fb.firestore().collection("results").add(result)
            .then(function(docRef) {
                that.setState({
                    id: docRef.id,
                    message: {txt: "Guardado con éxito", type: "success", showClose: true}});
            })
            .catch(function(error) {
                that.showMessage("Error al guardar, inténtalo de nuevo", "error", true);
            });
        } else {
            console.log("actualizando");
            this.props.fb.firestore().collection("results").doc(this.state.id).set(result)
            .then(function(docRef) {
                that.showMessage("Guardado con éxito", "success", true);
            })
            .catch(function(error) {
                that.showMessage("Error al guardar, inténtalo de nuevo", "error", true);
            });
        }
    }

    handleValueChange(event) {
        var newState = this.state.result;
        newState[event.target.name] = event.target.value;
        this.setState({result: newState});
    }

    handleCloseModal() {
        this.setState({message: {txt: "", type: "info", showClose: false}});
    }

    handleSelect(eventKey) {
        this.setState({tabkey: eventKey});
    }

    resetState() {
        this.setState({
            exists: this.props.exists === 'true',
            loaded: false,
            result: new Result(), 
            id: this.props.id!== undefined? this.props.id: null, 
            message: {txt: "", type: "info", showClose: false},
            tabkey: "1"         
        });
    }

    handleChangeDate(date) {
        var result = this.state.result;
        result.fecha_nacimiento = date;
        this.setState({
          result: result
        });
    }

    showMessage(txt, type, showClose){
        this.setState({message: {txt: txt, type: type, showClose: showClose}})
    }

    render() {
        const result = (
            <div>
                <div className="static-modal ">
                    <Modal className={"modal-" + this.state.message.type} show={this.state.message.txt !== ""} 
                            onHide={this.handleCloseModal}>
                        <Modal.Body>
                            {this.state.message.txt}
                        </Modal.Body>
                        {this.state.message.showClose && (
                        <Modal.Footer>
                            <Button bsStyle={this.state.message.type} onClick={this.handleCloseModal}>Close</Button>
                        </Modal.Footer>
                        )}
                    </Modal>
                </div>
                <div className="text-right">
                    <Button bsStyle="success" onClick={this.save}>Guardar</Button>
                </div>
                <Nav bsStyle="tabs" activeKey={this.state.tabkey} onSelect={k => this.handleSelect(k)}>
                    <NavItem eventKey="1">
                        Datos personales
                    </NavItem>
                    <NavItem eventKey="2">
                        TTO
                    </NavItem>
                    <NavItem eventKey="3">
                        ECG
                    </NavItem>
                    <NavItem eventKey="4">
                        AP
                    </NavItem>
                    <NavItem eventKey="5">
                        ANALITICA
                    </NavItem>
                    <NavItem eventKey="6">
                        PRUEBAS
                    </NavItem>
                </Nav>
                {this.state.tabkey === "1" && (
                    <div className=" tab-content">
                        <div className='row'>
                            <div className="col-xs-12">
                                <FieldGroup
                                    id="identificacionInput"
                                    type="text"
                                    label="Identificación"
                                    placeholder="Identificación"
                                    onChange={this.handleValueChange}
                                    name='identificacion'
                                    value={this.state.result.identificacion}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                                <FieldGroup
                                    id="nombreInput"
                                    type="text"
                                    label="Nombre"
                                    placeholder="Nombre del usuario"
                                    onChange={this.handleValueChange}
                                    name='nombre'
                                    value={this.state.result.nombre}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                                <FieldGroup
                                    id="apellido1Input"
                                    type="text"
                                    label="Primer apellido"
                                    placeholder="Primer apellido"
                                    onChange={this.handleValueChange}
                                    name='apellido1'
                                    value={this.state.result.apellido1}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-4 col-lg-4 col-lg-offset-0">
                                <FieldGroup
                                    id="apellido2Input"
                                    type="text"
                                    label="Segundo apellido"
                                    placeholder="Segundo apellido"
                                    onChange={this.handleValueChange}
                                    name='apellido2'
                                    value={this.state.result.apellido2}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FormGroup controlId="formControlsSelect">
                                    <ControlLabel>Fecha de nacimiento</ControlLabel>
                                    <DatePicker 
                                        name="fecha_nacimiento" 
                                        weekStartsOn={1} 
                                        id="fechaNacimientoInput" 
                                        value={this.state.result.fecha_nacimiento} 
                                        onChange={
                                            (isoString, inputValue) => {
                                                var stateResult = this.state.result;
                                                stateResult.fecha_nacimiento = isoString;
                                                this.setState({result: stateResult});
                                            }} 
                                        />
                                </FormGroup>
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    name="sexo" 
                                    id="sexoInput" 
                                    label="Sexo"
                                    value={this.state.result.sexo} 
                                    onChange={this.handleValueChange}
                                    name='sexo'
                                    options={[{value: "H", label: "Hombre"},{value: "M", label: "Mujer"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="edad_inclusionInput"
                                    type="number"
                                    label="Edad inclusion"
                                    placeholder="Edad inclusion"
                                    onChange={this.handleValueChange}
                                    name='edad_inclusion'
                                    value={this.state.result.edad_inclusion}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="number"
                                    label="Peso"
                                    placeholder="Peso"
                                    onChange={this.handleValueChange}
                                    name='peso'
                                    value={this.state.result.peso}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="number"
                                    label="Altura"
                                    placeholder="Altura"
                                    onChange={this.handleValueChange}
                                    name='altura'
                                    value={this.state.result.altura}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="number"
                                    label="IMC"
                                    placeholder="IMC"
                                    onChange={this.handleValueChange}
                                    name='IMC'
                                    value={this.state.result.IMC}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="number"
                                    label="Perímetro"
                                    placeholder="Perímetro"
                                    onChange={this.handleValueChange}
                                    name='perimetro'
                                    value={this.state.result.perimetro}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="number"
                                    label="Tórax"
                                    placeholder="Tórax"
                                    onChange={this.handleValueChange}
                                    name='torax'
                                    value={this.state.result.torax}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="number"
                                    label="Perímetro abdominal"
                                    placeholder="Perímetro abdominal"
                                    onChange={this.handleValueChange}
                                    name='perimetro_abd'
                                    value={this.state.result.perimetro_abd}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="text"
                                    label="Pectus Normal"
                                    placeholder="Pectus Normal"
                                    onChange={this.handleValueChange}
                                    name='pectus_normal'
                                    value={this.state.result.pectus_normal}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="text"
                                    label="TAS MSD"
                                    placeholder="TAS MSD"
                                    onChange={this.handleValueChange}
                                    name='TAS_MSD'
                                    value={this.state.result.TAS_MSD}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="text"
                                    label="TAD MSD"
                                    placeholder="TAD MSD"
                                    onChange={this.handleValueChange}
                                    name='TAD_MSD'
                                    value={this.state.result.TAD_MSD}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="text"
                                    label="TAS MSI"
                                    placeholder="TAS MSI"
                                    onChange={this.handleValueChange}
                                    name='TAS_MSI'
                                    value={this.state.result.TAS_MSI}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="text"
                                    label="TAD_MSI"
                                    placeholder="TAD_MSI"
                                    onChange={this.handleValueChange}
                                    name='TAD_MSI'
                                    value={this.state.result.TAS_MSI}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="text"
                                    label="Exploración Patológica"
                                    placeholder="Exploración Patológica"
                                    onChange={this.handleValueChange}
                                    name='expl_patolog'
                                    value={this.state.result.expl_patolog}
                                    />
                            </div>
                        </div>
                    </div>
                )}
                {this.state.tabkey === "2" && (
                    /* TTO */
                    <div className='row tab-content'>
                        <div className="col-xs-12 col-sm-12 col-md-offset-6 col-md-6 col-lg-4">
                            <SelectFieldGroup
                                    id="iecaInput" 
                                    label="IECA"
                                    value={this.state.result.IECA} 
                                    onChange={this.handleValueChange}
                                    name='IECA'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                        </div>
                        <div className="col-xs-12 col-sm-12 col-md-offset-6 col-md-6 col-lg-4 col-lg-offset-0">
                            <FieldGroup
                                id="apellido2Input"
                                type="text"
                                label="Cual IECA"
                                placeholder="Cual IECA"
                                onChange={this.handleValueChange}
                                name='cual_IECA'
                                value={this.state.result.cual_IECA}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
        return result;
    }
   
}
