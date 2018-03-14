import React from 'react';
import './Detail.css';
import {FormGroup, ControlLabel, Button, Modal, Nav, NavItem} from 'react-bootstrap';
import Result from '../../Model/result';
import { map } from 'lodash';
//import DatePicker from '../Form/DatePicker';
import DatePicker from '../Form/DatePicker/DatePicker';
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
        if(!this.state.loaded || this.state.exists !== (this.props.exists === "true")) {
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
            result[key] = value;
        });
        this.setState({result: currentState});
        var that = this;
        if(this.props.exists !== "true" ){
            result.fecha_registro = new Date().toISOString();
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
                <div className="row btns">
                    <div className="col-xs-12 col-sm-4 col-sm-offset-8 col-md-4 col-md-offset-8 col-lg-3 col-lg-offset-9">
                        <Button bsStyle="success" block="true" onClick={this.save}>Guardar</Button>
                    </div>
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
                    <div className="tab-content">
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
                                        value={this.state.result.fecha_nacimiento} 
                                        onChange={
                                            (isoString) => {
                                                console.log(isoString);
                                                var stateResult = this.state.result;
                                                stateResult.fecha_nacimiento = isoString;
                                                this.setState({result: stateResult});
                                            }}
                                        />    
                                </FormGroup>
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
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
                                    id="imcInput"
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
                                    id="ptoraxInput"
                                    type="number"
                                    label="Perímetro Tórax"
                                    placeholder="Perímetro Tórax"
                                    onChange={this.handleValueChange}
                                    name='perimetro_torax'
                                    value={this.state.result.perimetro_torax}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pabdInput"
                                    type="number"
                                    label="Perímetro abdominal"
                                    placeholder="Perímetro abdominal"
                                    onChange={this.handleValueChange}
                                    name='perimetro_abd'
                                    value={this.state.result.perimetro_abd}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="pnormalInput" 
                                    label="Pectus Normal"
                                    value={this.state.result.pectus_normal} 
                                    onChange={this.handleValueChange}
                                    name='pectus_normal'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="pesoInput"
                                    type="number"
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
                                    type="number"
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
                                    type="number"
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
                                    type="number"
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
                    <div className="tab-content">
                        <div className='row'>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="iecaInput" 
                                    label="IECA"
                                    value={this.state.result.IECA} 
                                    onChange={this.handleValueChange}
                                    name='IECA'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="cual_IECAInput"
                                    type="text"
                                    label="Cual IECA"
                                    placeholder="Cual IECA"
                                    onChange={this.handleValueChange}
                                    name='cual_IECA'
                                    value={this.state.result.cual_IECA}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                <FieldGroup
                                    id="dosis_IECAInput"
                                    type="number"
                                    label="Dosis IECA (mg/día)"
                                    placeholder="Dosis IECA"
                                    onChange={this.handleValueChange}
                                    name='dosis_IECA'
                                    value={this.state.result.dosis_IECA}
                                />
                            </div>
                        </div>
                        <div className='row'>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="ARA_IIInput" 
                                    label="ARA II"
                                    value={this.state.result.ARA_II} 
                                    onChange={this.handleValueChange}
                                    name='ARA_II'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="cual_ARA_IIInput"
                                    type="text"
                                    label="Cual ARA II"
                                    placeholder="Cual ARA II"
                                    onChange={this.handleValueChange}
                                    name='cual_ARA_II'
                                    value={this.state.result.cual_ARA_II}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                <FieldGroup
                                    id="dosis_ARA_IIInput"
                                    type="number"
                                    label="Dosis ARA II"
                                    placeholder="Dosis ARA II"
                                    onChange={this.handleValueChange}
                                    name='dosis_ARA_II'
                                    value={this.state.result.dosis_ARA_II}
                                />
                            </div>
                        </div>
                        <div className='row'>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="DIU_TIAZInput" 
                                    label="DIU TIAZ"
                                    value={this.state.result.DIU_TIAZ} 
                                    onChange={this.handleValueChange}
                                    name='DIU_TIAZ'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="cual_DIU_TIAZInput"
                                    type="text"
                                    label="Cual DIU TIAZ"
                                    placeholder="Cual DIU TIAZ"
                                    onChange={this.handleValueChange}
                                    name='cual_DIU_TIAZ'
                                    value={this.state.result.cual_DIU_TIAZ}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                <FieldGroup
                                    id="dosis_DIU_TIAZInput"
                                    type="number"
                                    label="Dosis DIU TIAZ"
                                    placeholder="Dosis DIU TIAZ"
                                    onChange={this.handleValueChange}
                                    name='dosis_DIU_TIAZ'
                                    value={this.state.result.dosis_DIU_TIAZ}
                                />
                            </div>
                        </div>
                        <div className='row'>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="ACA_DHPInput" 
                                    label="ACA DHP"
                                    value={this.state.result.ACA_DHP} 
                                    onChange={this.handleValueChange}
                                    name='ACA_DHP'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="cual_ACA_DHPInput"
                                    type="text"
                                    label="Cual ACA DHP"
                                    placeholder="Cual ACA DHP"
                                    onChange={this.handleValueChange}
                                    name='cual_ACA_DHP'
                                    value={this.state.result.cual_ACA_DHP}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                <FieldGroup
                                    id="dosis_ACA_DHP2Input"
                                    type="number"
                                    label="Dosis ACA DHP"
                                    placeholder="Dosis ACA DHP"
                                    onChange={this.handleValueChange}
                                    name='dosis_ACA_DHP'
                                    value={this.state.result.dosis_ACA_DHP}
                                />
                            </div>
                        </div>
                        <div className='row'>    
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="verap_diltInput" 
                                    label="Verap Dilt"
                                    value={this.state.result.verap_dilt} 
                                    onChange={this.handleValueChange}
                                    name='verap_dilt'
                                    options={[{value: 0, label: "No"}, {value: 1, label: "Diltiazem"}, {value: 2, label: "Verapamil"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="dosis_verap_diltInput"
                                    type="number"
                                    label="Dosis Verap Dilt"
                                    placeholder="Dosis Verap Dilt"
                                    onChange={this.handleValueChange}
                                    name='dosis_verap_dilt'
                                    value={this.state.result.dosis_verap_dilt}
                                />
                            </div>
                        </div>
                        <div className='row'>    
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="alfabloqInput" 
                                    label="Alfabloq"
                                    value={this.state.result.alfabloq} 
                                    onChange={this.handleValueChange}
                                    name='alfabloq'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="cual_ACA_DHPInput"
                                    type="text"
                                    label="Cual Alfabloq"
                                    placeholder="Cual Alfabloq"
                                    onChange={this.handleValueChange}
                                    name='cual_alfabloq'
                                    value={this.state.result.cual_alfabloq}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                <FieldGroup
                                    id="dosis_alfabloqInput"
                                    type="number"
                                    label="Dosis Alfabloq"
                                    placeholder="Dosis Alfabloq"
                                    onChange={this.handleValueChange}
                                    name='dosis_alfabloq'
                                    value={this.state.result.dosis_alfabloq}
                                />
                            </div>
                        </div>
                        <div className='row'>    
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="betabloqInput" 
                                    label="Betabloq"
                                    value={this.state.result.betabloq} 
                                    onChange={this.handleValueChange}
                                    name='betabloq'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="cual_betabloqInput"
                                    type="text"
                                    label="Cual Betabloq"
                                    placeholder="Cual Betabloq"
                                    onChange={this.handleValueChange}
                                    name='cual_betabloq'
                                    value={this.state.result.cual_betabloq}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                <FieldGroup
                                    id="dosis_betabloqInput"
                                    type="number"
                                    label="Dosis Betabloq"
                                    placeholder="Dosis Betabloq"
                                    onChange={this.handleValueChange}
                                    name='dosis_betabloq'
                                    value={this.state.result.dosis_betabloq}
                                />
                            </div>
                        </div>
                        <div className='row'>    
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="aldost_inhInput" 
                                    label="ALDOST INH"
                                    value={this.state.result.aldost_inh} 
                                    onChange={this.handleValueChange}
                                    name='aldost_inh'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="cual_aldost_inh_input"
                                    type="text"
                                    label="Cual ALDOST INH"
                                    placeholder="Cual ALDOST INH"
                                    onChange={this.handleValueChange}
                                    name='cual_aldost_inh'
                                    value={this.state.result.cual_aldost_inh}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                <FieldGroup
                                    id="dosis_aldost_inhInput"
                                    type="number"
                                    label="Dosis ALDOST INH"
                                    placeholder="Dosis ALDOST INH"
                                    onChange={this.handleValueChange}
                                    name='dosis_aldost_inh'
                                    value={this.state.result.dosis_aldost_inh}
                                />
                            </div>
                        </div>
                        <div className='row'>    
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="diu_asa_input" 
                                    label="DIU ASA"
                                    value={this.state.result.diu_asa} 
                                    onChange={this.handleValueChange}
                                    name='diu_asa'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="cual_diu_asa_nput"
                                    type="text"
                                    label="Cual DIU ASA"
                                    placeholder="Cual DIU ASA"
                                    onChange={this.handleValueChange}
                                    name='cual_diu_asa'
                                    value={this.state.result.cual_diu_asa}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                <FieldGroup
                                    id="dosis_diu_asa_input"
                                    type="number"
                                    label="Dosis DIU ASA"
                                    placeholder="Dosis DIU ASA"
                                    onChange={this.handleValueChange}
                                    name='dosis_diu_asa'
                                    value={this.state.result.dosis_diu_asa}
                                />
                            </div>
                        </div>
                        <div className='row'>    
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="aliskiren_input" 
                                    label="Aliskiren"
                                    value={this.state.result.aliskiren} 
                                    onChange={this.handleValueChange}
                                    name='aliskiren'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <FieldGroup
                                    id="dosis_aliskiren_input"
                                    type="number"
                                    label="Dosis Aliskiren"
                                    placeholder="Dosis Aliskiren"
                                    onChange={this.handleValueChange}
                                    name='dosis_aliskiren'
                                    value={this.state.result.dosis_aliskiren}
                                />
                            </div>
                        </div>
                        <div className='row'>    
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="AAS_input" 
                                    label="AAS"
                                    value={this.state.result.AAS} 
                                    onChange={this.handleValueChange}
                                    name='AAS'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="clopidogrel_input" 
                                    label="Clopidogrel"
                                    value={this.state.result.clopidogrel} 
                                    onChange={this.handleValueChange}
                                    name='clopidogrel'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="ACO_input" 
                                    label="ACO"
                                    value={this.state.result.ACO} 
                                    onChange={this.handleValueChange}
                                    name='ACO'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="ESTATINAS_input" 
                                    label="Estatinas"
                                    value={this.state.result.ESTATINAS} 
                                    onChange={this.handleValueChange}
                                    name='ESTATINAS'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="METFORMINA_input" 
                                    label="Metformina"
                                    value={this.state.result.METFORMINA} 
                                    onChange={this.handleValueChange}
                                    name='METFORMINA'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="SFU_input" 
                                    label="SFU"
                                    value={this.state.result.SFU} 
                                    onChange={this.handleValueChange}
                                    name='SFU'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="GLICLAZ_input" 
                                    label="GLICLAZ"
                                    value={this.state.result.GLICLAZ} 
                                    onChange={this.handleValueChange}
                                    name='GLICLAZ'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="GLITAZONAS_input" 
                                    label="GLITAZONAS"
                                    value={this.state.result.GLITAZONAS} 
                                    onChange={this.handleValueChange}
                                    name='GLITAZONAS'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="IDPP4_input" 
                                    label="IDPP4"
                                    value={this.state.result.IDPP4} 
                                    onChange={this.handleValueChange}
                                    name='IDPP4'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="SGLT2_input" 
                                    label="SGLT2"
                                    value={this.state.result.SGLT2} 
                                    onChange={this.handleValueChange}
                                    name='SGLT2'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="GLP1_input" 
                                    label="GLP1"
                                    value={this.state.result.GLP1} 
                                    onChange={this.handleValueChange}
                                    name='GLP1'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <SelectFieldGroup
                                    id="INSULINA_input" 
                                    label="Insulina"
                                    value={this.state.result.INSULINA} 
                                    onChange={this.handleValueChange}
                                    name='INSULINA'
                                    options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                    />
                            </div>
                        </div>
                    </div>
                )}
                {this.state.tabkey === "3" && (
                    /* ECG */
                    <div className="tab-content">
                    <div className='row'>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FormGroup controlId="formControlsSelect">
                                <ControlLabel>Fecha del ECG</ControlLabel>
                                <DatePicker 
                                    value={this.state.result.fecha_ECG} 
                                    onChange={
                                        (isoString) => {
                                            console.log(isoString);
                                            var stateResult = this.state.result;
                                            stateResult.fecha_ECG = isoString;
                                            this.setState({result: stateResult});
                                        }}
                                    />    
                            </FormGroup>
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="sexoInput" 
                                label="Ritmo"
                                value={this.state.result.ritmo} 
                                onChange={this.handleValueChange}
                                name='ritmo'
                                options={[
                                    {value: 0, label: "Ritmo sinusal normal"},
                                    {value: 1, label: "FA"},
                                    {value: 2, label: "Flutter"},
                                    {value: 3, label: "Taquicardia auricular"}
                                ]}
                                />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="FCInput"
                                type="number"
                                label="FC"
                                placeholder="FC"
                                onChange={this.handleValueChange}
                                name='FC'
                                value={this.state.result.FC}
                                />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="PRInput"
                                type="number"
                                label="PR"
                                placeholder="PR"
                                onChange={this.handleValueChange}
                                name='PR'
                                value={this.state.result.PR}
                                />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="QRSInput"
                                type="number"
                                label="QRS"
                                placeholder="QRS"
                                onChange={this.handleValueChange}
                                name='QRS'
                                value={this.state.result.QRS}
                                />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="QTcInput"
                                type="number"
                                label="QTc"
                                placeholder="QTc"
                                onChange={this.handleValueChange}
                                name='QTc'
                                value={this.state.result.QTc}
                                />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="EjePInput"
                                type="number"
                                label="Eje P"
                                placeholder="Eje P"
                                onChange={this.handleValueChange}
                                name='EJE_P'
                                value={this.state.result.EJE_P}
                                />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="EjeQRSInput"
                                type="number"
                                label="Eje QRS"
                                placeholder="Eje QRS"
                                onChange={this.handleValueChange}
                                name='EJE_QRS'
                                value={this.state.result.EJE_QRS}
                                />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="EjeQRSInput"
                                type="number"
                                label="Eje T"
                                placeholder="Eje T"
                                onChange={this.handleValueChange}
                                name='EJE_T'
                                value={this.state.result.EJE_T}
                                />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="P_alturaInput"
                                type="number"
                                label="P Altura"
                                placeholder="P Altura"
                                onChange={this.handleValueChange}
                                name='P_altura'
                                value={this.state.result.P_altura}
                                />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="P_melladaInput" 
                                label="P Mellada"
                                value={this.state.result.P_mellada} 
                                onChange={this.handleValueChange}
                                name='P_mellada'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="P_en_V1_1mmInput" 
                                label="P en V1 > 1mm"
                                value={this.state.result.P_en_V1_1mm} 
                                onChange={this.handleValueChange}
                                name='P_en_V1_1mm'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="Q_patologicaInput" 
                                label="Q Patológica"
                                value={this.state.result.Q_patologica} 
                                onChange={this.handleValueChange}
                                name='Q_patologica'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="Q_I_y_aVL_no_patologInput" 
                                label="Q I y aVL no patológica"
                                value={this.state.result.Q_I_y_aVL_no_patolog} 
                                onChange={this.handleValueChange}
                                name='Q_I_y_aVL_no_patolog'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="Q_inferior_no_patologInput" 
                                label="Q  inferior no patológica"
                                value={this.state.result.Q_inferior_no_patolog} 
                                onChange={this.handleValueChange}
                                name='Q_inferior_no_patolog'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="Q_V3_4_no_patologInput" 
                                label="Q V3-4 no patológica"
                                value={this.state.result.Q_V3_4_no_patolog} 
                                onChange={this.handleValueChange}
                                name='Q_V3_4_no_patolog'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="Q_V5_6_no_patologInput" 
                                label="Q V5-6 no patológica"
                                value={this.state.result.Q_V5_6_no_patolog} 
                                onChange={this.handleValueChange}
                                name='Q_V5_6_no_patolog'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="muesca_inf_QRSInput" 
                                label="Muesca Inferior QRS"
                                value={this.state.result.muesca_inf_QRS} 
                                onChange={this.handleValueChange}
                                name='muesca_inf_QRS'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="muesca_lat_QRSInput" 
                                label="Muesca Lateral QRS"
                                value={this.state.result.muesca_lat_QRS} 
                                onChange={this.handleValueChange}
                                name='muesca_lat_QRS'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="muesca_ant_QRSInput" 
                                label="Muesca Anterior QRS"
                                value={this.state.result.muesca_ant_QRS} 
                                onChange={this.handleValueChange}
                                name='muesca_ant_QRS'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"}
                                ]}
                                />    
                        </div>
                    </div>
                    <div className="row">    
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="R_en_I_Input"
                                type="number"
                                label="R en I"
                                placeholder="R en I"
                                onChange={this.handleValueChange}
                                name='R_en_I'
                                value={this.state.result.R_en_I}
                            />
                        </div>   
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="R_en_III_Input"
                                type="number"
                                label="R en III"
                                placeholder="R en III"
                                onChange={this.handleValueChange}
                                name='R_en_III'
                                value={this.state.result.R_en_III}
                            />
                        </div>  
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="R_en_aVF_Input"
                                type="number"
                                label="R en aVF"
                                placeholder="R en aVF"
                                onChange={this.handleValueChange}
                                name='R_en_aVF'
                                value={this.state.result.R_en_aVF}
                            />
                        </div>   
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="R_en_aVL_Input"
                                type="number"
                                label="R en aVL"
                                placeholder="R en aVL"
                                onChange={this.handleValueChange}
                                name='R_en_aVL'
                                value={this.state.result.R_en_aVL}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="R_en_V2_Input"
                                type="number"
                                label="R en V2"
                                placeholder="R en V2"
                                onChange={this.handleValueChange}
                                name='R_en_V2'
                                value={this.state.result.R_en_V2}
                            />
                        </div>      
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="R_en_V5_Input"
                                type="number"
                                label="R en V5"
                                placeholder="R en V5"
                                onChange={this.handleValueChange}
                                name='R_en_V5'
                                value={this.state.result.R_en_V5}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="R_en_V6_Input"
                                type="number"
                                label="R en V6"
                                placeholder="R en V6"
                                onChange={this.handleValueChange}
                                name='R_en_V6'
                                value={this.state.result.R_en_V6}
                            />
                        </div>   
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="S_en_I_Input"
                                type="number"
                                label="S en I"
                                placeholder="S en I"
                                onChange={this.handleValueChange}
                                name='S_en_I'
                                value={this.state.result.S_en_I}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="S_en_II_Input"
                                type="number"
                                label="S en II"
                                placeholder="S en II"
                                onChange={this.handleValueChange}
                                name='S_en_II'
                                value={this.state.result.S_en_II}
                            />
                        </div>  
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="S_en_III_Input"
                                type="number"
                                label="S en III"
                                placeholder="S en III"
                                onChange={this.handleValueChange}
                                name='S_en_III'
                                value={this.state.result.S_en_III}
                            />
                        </div>  
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="S_en_V1_Input"
                                type="number"
                                label="S en V1"
                                placeholder="S en V1"
                                onChange={this.handleValueChange}
                                name='S_en_V1'
                                value={this.state.result.S_en_V1}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="S_en_V3_Input"
                                type="number"
                                label="S en V3"
                                placeholder="S en V3"
                                onChange={this.handleValueChange}
                                name='S_en_V3'
                                value={this.state.result.S_en_V3}
                            />
                        </div>  
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="S_en_V6_Input"
                                type="number"
                                label="S en V6"
                                placeholder="S en V6"
                                onChange={this.handleValueChange}
                                name='S_en_V6'
                                value={this.state.result.S_en_V6}
                            />
                        </div>  
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="bloqueos_ramaInput" 
                                label="Bloqueos Rama"
                                value={this.state.result.bloqueos_rama} 
                                onChange={this.handleValueChange}
                                name='bloqueos_rama'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "BIRIHH"},
                                    {value: 2, label: "BCRIHH"},
                                    {value: 3, label: "BIRDHH"},
                                    {value: 4, label: "BCRDHH"}
                                ]}
                                />    
                        </div>        
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="hemibloqueosInput" 
                                label="Hemibloqueos"
                                value={this.state.result.hemibloqueos} 
                                onChange={this.handleValueChange}
                                name='hemibloqueos'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "HIA"},
                                    {value: 2, label: "HIP"},
                                ]}
                                />    
                        </div>        
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="Sokolow_Input"
                                type="number"
                                label="Indice de Sokolow"
                                placeholder="Indice de Sokolow"
                                onChange={this.handleValueChange}
                                name='Sokolow'
                                value={this.state.result.Sokolow}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="Lyon_Input"
                                type="number"
                                label="Indice de Lyon"
                                placeholder="Indice de Lyon"
                                onChange={this.handleValueChange}
                                name='Lyon'
                                value={this.state.result.Lyon}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="Cornell_Input"
                                type="number"
                                label="Indice de Cornell"
                                placeholder="Indice de Cornell"
                                onChange={this.handleValueChange}
                                name='Cornell'
                                value={this.state.result.Cornell}
                            />
                        </div> 
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="STInput" 
                                label="ST"
                                value={this.state.result.ST} 
                                onChange={this.handleValueChange}
                                name='ST'
                                options={[
                                    {value: 0, label: "Isoeléctrico"},
                                    {value: 1, label: "Descendido"},
                                    {value: 2, label: "Ascendido"},
                                    {value: 3, label: "Descendido y descendente"},
                                ]}
                                />   
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="ST_alteradoInput" 
                                label="ST Alterado"
                                value={this.state.result.ST_alterado} 
                                onChange={this.handleValueChange}
                                name='ST_alterado'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Lateral"},
                                    {value: 2, label: "Inferior"},
                                    {value: 3, label: "Precordiales"},
                                    {value: 4, label: "Lateral e inferior"},
                                ]}
                                />   
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="T_positivasInput" 
                                label="T Positivas"
                                value={this.state.result.T_positivas} 
                                onChange={this.handleValueChange}
                                name='T_positivas'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "T negativas asimétricas"},
                                    {value: 2, label: "T negativas simétricas"},
                                ]}
                                />   
                        </div> 
                    </div>
                    <div className="row">    
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="anchura_T_Input"
                                type="number"
                                label="Anchura T"
                                placeholder="Anchura T"
                                onChange={this.handleValueChange}
                                name='anchura_T'
                                value={this.state.result.anchura_T}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="altura_T_inf_Input"
                                type="number"
                                label="Altura T Inferior"
                                placeholder="Altura T Inferior"
                                onChange={this.handleValueChange}
                                name='altura_T_inf'
                                value={this.state.result.altura_T_inf}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="altura_T_lat_Input"
                                type="number"
                                label="Altura T Lateral"
                                placeholder="Altura T Lateral"
                                onChange={this.handleValueChange}
                                name='altura_T_lat'
                                value={this.state.result.altura_T_lat}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <FieldGroup
                                id="altura_T_precord_Input"
                                type="number"
                                label="Altura T Precord"
                                placeholder="Altura T Precord"
                                onChange={this.handleValueChange}
                                name='altura_T_precord'
                                value={this.state.result.altura_T_precord}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="T_plana_Input" 
                                label="T Plana"
                                value={this.state.result.T_plana} 
                                onChange={this.handleValueChange}
                                name='T_plana'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí, lateral"},
                                    {value: 2, label: "Sí, inferior"},
                                    {value: 3, label: "Precordiales Izquierdas"},
                                    {value: 4, label: "Inferolateral"},
                                    {value: 5, label: "Inferolateral y precordiales"},
                                ]}
                                />   
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="T_negativas_Input" 
                                label="T Negativas"
                                value={this.state.result.T_negativas} 
                                onChange={this.handleValueChange}
                                name='T_negativas'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí, lateral"},
                                    {value: 2, label: "Sí, inferior"},
                                    {value: 3, label: "Precordiales Izquierdas"},
                                    {value: 4, label: "Inferolateral"},
                                    {value: 5, label: "Inferolateral y precordiales"},
                                ]}
                                />   
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                            <SelectFieldGroup
                                id="extrasistoles_Input" 
                                label="Extrasístoles"
                                value={this.state.result.extrasistoles} 
                                onChange={this.handleValueChange}
                                name='extrasistoles'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Auriculares"},
                                    {value: 2, label: "Nodales"},
                                    {value: 3, label: "Ventriculares BCRD"},
                                    {value: 4, label: "Ventriculares BCRI"},
                                ]}
                                />   
                        </div>
                    </div>   
                </div>                
                    
                )}
                {this.state.tabkey === "4" && (<span>AP</span>)}
                {this.state.tabkey === "5" && (<span>ANALITICA</span>)}
                {this.state.tabkey === "6" && (<span>PRUEBAS</span>)}
                <div className="row btns top">
                    <div className="col-xs-12 col-sm-4 col-sm-offset-8 col-md-4 col-md-offset-8 col-lg-3 col-lg-offset-9">
                        <Button bsStyle="success" block="true" onClick={this.save}>Guardar</Button>
                    </div>
                </div>
            </div>
        );
        return result;
    }
   
}
