import React from 'react';
import './Detail.css';
import {Button, Nav, NavItem, Glyphicon} from 'react-bootstrap';
import Result from '../../Model/result';
import { map } from 'lodash';
import DatePicker from '../Form/DatePicker/DatePicker';
import FieldGroup from '../Form/FieldGroup';
import SelectFieldGroup from '../Form/SelectFieldGroup';
import CustomModal from '../Form/Modal/CustomModal';

export default class Detail extends React.Component {
    constructor(props) {
        super(props);
        this.save = this.save.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.resetState = this.resetState.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
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

    componentWillReceiveProps(nextProps, nextState) {
        this.resetState(nextProps);
    }

    componentDidMount() {
        this.resetState(this.props);
    }

    componentDidUpdate() {
        if(!this.state.loaded) {this.setState({loaded: true}); this.load();}
    }

    load() {
        if(this.state.exists) {
            this.showMessage("Cargando...", "info", false);
            var docRef = this.props.fb.firestore().collection("results").doc(this.state.id);
            var that = this;
            docRef.get().then(function(doc) {
                that.setState({
                    result: doc.data(), 
                    message: {txt: "", type: "info", showClose: false}});
            }).catch(function(error) {
                that.setState({
                    result: new Result(), 
                    message: {txt: "El documento que está intentando cargar no existe.", type: "error", showClose: true, exists: false}
                });
            });
        } else {
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
        if(this.state.exists){
            this.props.fb.firestore().collection("results").doc(this.state.id).set(result)
            .then(function(docRef) {
                that.showMessage("Guardado con éxito", "success", true);
            })
            .catch(function(error) {
                that.showMessage("Error al guardar, inténtalo de nuevo", "error", true);
            });
        } else {
            result.fecha_registro = new Date().toISOString();
            var lockRef = this.props.fb.firestore().collection("lock").doc("A");
            this.props.fb.firestore().runTransaction(transaction => {
                return transaction.get(lockRef).then(sfDoc => {
                    let id = (1 + sfDoc.data().results);
                    transaction.update(lockRef, { results: id });
                    let strId = "P" + ("" + id).padStart(10, "0"); 
                    result.id = strId;
                    result.creatorUser = this.props.fb.auth().currentUser.email;
                    this.props.fb.firestore().collection("results").doc(strId).set(result)
                    .then(() => {
                        that.setState({
                            id: strId,
                            exists: true,
                            message: {txt: "Guardado con éxito", type: "success", showClose: true}});
                    }).catch((error) => {
                        that.showMessage("Error al guardar, inténtalo de nuevo", "error", true);
                        console.log(error);
                    });
                })
            })
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

    resetState(props) {
        this.setState({
            exists: props.exists === 'true',
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
                <div className="pageTitle">
                    <h3 className={'teal-text'}>{this.state.exists ? 'Editar Usuario: ' + this.state.id : 'Crear Nuevo Usuario'}</h3>
                </div>
                <CustomModal handleCloseModal={this.handleCloseModal} message={this.state.message} />
                <div className="row btns">
                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-3">
                        {this.state.exists ? 'Creado por: ' + this.state.result.creatorUser : ''}
                    </div>
                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-6"></div>
                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-3">
                        <Button bsStyle="success" block={true} onClick={this.save}><Glyphicon glyph="floppy-disk"/> Guardar</Button>
                    </div>
                </div>
                <div className='row'>
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
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
                </div>
                <div className="row">
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
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                        <SelectFieldGroup
                            id="visitaInput" 
                            label="Visita"
                            value={this.state.result.visita} 
                            onChange={this.handleValueChange}
                            name='visita'
                            options={[
                                {value: 1, label: "1ª"},
                                {value: 2, label: "2ª"},
                                {value: 3, label: "3ª"},
                                {value: 4, label: "4ª"},
                                {value: 5, label: "5ª"},
                                {value: 6, label: "6ª"},
                                {value: 7, label: "7ª"},
                                {value: 8, label: "8ª"},
                                {value: 9, label: "9ª"},
                                {value: 10, label: "10ª"}
                            ]}
                            />
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
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <DatePicker 
                                    id="fecha_nacimiento_datepicker"
                                    label="Fecha de nacimiento"
                                    value={this.state.result.fecha_nacimiento} 
                                    onChange={
                                        (isoString) => {
                                            
                                            var stateResult = this.state.result;
                                            stateResult.fecha_nacimiento = isoString;
                                            this.setState({result: stateResult});
                                        }}
                                    />    
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
                                    value={this.state.result.TAD_MSI}
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
                            <DatePicker 
                                id="fecha_ECG_datepicker"
                                label="Fecha del ECG"
                                value={this.state.result.fecha_ECG} 
                                onChange={
                                    (isoString) => {
                                        
                                        var stateResult = this.state.result;
                                        stateResult.fecha_ECG = isoString;
                                        this.setState({result: stateResult});
                                    }}
                                />    
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
                {this.state.tabkey === "4" && (
                    /* AP */
                    <div className="tab-content">
                        <div className='row'>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="fumadorInput" 
                                    label="Fumador"
                                    value={this.state.result.fumador} 
                                    onChange={this.handleValueChange}
                                    name='fumador'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí"},
                                        {value: 2, label: "Exfumador"},
                                    ]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <FieldGroup
                                    id="cigarrillos_Input"
                                    type="number"
                                    label="Cigarrillos"
                                    placeholder="Cigarrillos"
                                    onChange={this.handleValueChange}
                                    name='cigarrillos'
                                    value={this.state.result.cigarrillos}
                                />
                            </div> 
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="alcoholInput" 
                                    label="Alcohol"
                                    value={this.state.result.alcohol} 
                                    onChange={this.handleValueChange}
                                    name='alcohol'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí"},
                                        {value: 2, label: "Exalcohólico"},
                                    ]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <FieldGroup
                                    id="copas_Input"
                                    type="number"
                                    label="Copas"
                                    placeholder="Copas"
                                    onChange={this.handleValueChange}
                                    name='copas'
                                    value={this.state.result.copas}
                                />
                            </div> 
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="sal_Input" 
                                    label="Sal"
                                    value={this.state.result.sal} 
                                    onChange={this.handleValueChange}
                                    name='sal'
                                    options={[
                                        {value: 0, label: "Normal"},
                                        {value: 1, label: "Poca"},
                                        {value: 2, label: "Excesiva"},
                                    ]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="dieta_mediterranea_Input" 
                                    label="Dieta Mediterránea"
                                    value={this.state.result.dieta_mediterranea} 
                                    onChange={this.handleValueChange}
                                    name='dieta_mediterranea'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí"},
                                    ]}
                                    />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="HTA_Input" 
                                    label="HTA"
                                    value={this.state.result.HTA} 
                                    onChange={this.handleValueChange}
                                    name='HTA'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí"},
                                    ]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <FieldGroup
                                    id="años_HTA_Input"
                                    type="number"
                                    label="Años HTA"
                                    placeholder="Años HTA"
                                    onChange={this.handleValueChange}
                                    name='años_HTA'
                                    value={this.state.result.años_HTA}
                                    help="Años desde que se diagnosticó la HTA"
                                />  
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="HTA_secundaria_input" 
                                    label="HTA Secundaria"
                                    value={this.state.result.HTA_secundaria} 
                                    onChange={this.handleValueChange}
                                    name='HTA_secundaria'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí"},
                                    ]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="causa_HTA_secund_input" 
                                    label="Causa HTA Secundaria"
                                    value={this.state.result.causa_HTA_secund} 
                                    onChange={this.handleValueChange}
                                    name='causa_HTA_secund'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Coartación Aórtica"},
                                        {value: 2, label: "Renal"},
                                        {value: 3, label: "Feocromocitoma"},
                                        {value: 4, label: "Cushing"},
                                        {value: 5, label: "Otros"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="Dgtco_HTA_input" 
                                    label="Diagnótico HTA"
                                    help="¿Cómo se realizó el diagnóstico?"
                                    value={this.state.result.Dgtco_HTA} 
                                    onChange={this.handleValueChange}
                                    name='Dgtco_HTA'
                                    options={[
                                        {value: 0, label: "Asintomático, esencial"},
                                        {value: 1, label: "Cefalea"},
                                        {value: 2, label: "Insuficiencia cardiaca"},
                                        {value: 3, label: "ECG alterado"},
                                        {value: 4, label: "Cardiopatía isquémica"},
                                        {value: 5, label: "Tras AVC"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="AF_MS_input" 
                                    label="AF MS"
                                    value={this.state.result.AF_MS} 
                                    onChange={this.handleValueChange}
                                    name='AF_MS'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí, padres"},
                                        {value: 2, label: "Sí, padres y hermanos"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="AF_C_Isq_precoz_input" 
                                    label="AF C Isq. precoz"
                                    help="C Isq. Hombres < 55, mujer < 50"
                                    value={this.state.result.AF_C_Isq_precoz} 
                                    onChange={this.handleValueChange}
                                    name='AF_C_Isq_precoz'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Padres"},
                                        {value: 2, label: "Padres y/o hermanos"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="HTA_controlada_input" 
                                    label="HTA Controlada"
                                    help="¿Está bien controlada ahora?"
                                    value={this.state.result.HTA_controlada} 
                                    onChange={this.handleValueChange}
                                    name='HTA_controlada'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí"},
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="row">    
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="DM_input" 
                                    label="DM"
                                    value={this.state.result.DM} 
                                    onChange={this.handleValueChange}
                                    name='DM'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "DM tipo 1"},
                                        {value: 2, label: "DM 2 con ADO"},
                                        {value: 3, label: "DM 2 ID"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <DatePicker 
                                    label="Fecha de diagnóstico DM"
                                    value={this.state.result.fecha_dgtco_DM} 
                                    onChange={
                                        (isoString) => {
                                            
                                            var stateResult = this.state.result;
                                            stateResult.fecha_dgtco_DM = isoString;
                                            this.setState({result: stateResult});
                                        }}
                                    />    
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                <SelectFieldGroup
                                    id="DLP_input" 
                                    label="DLP"
                                    value={this.state.result.DLP} 
                                    onChange={this.handleValueChange}
                                    name='DLP'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí, sin TTO"},
                                        {value: 2, label: "Sí, con TTO"},
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="row"> 
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="IC_input" 
                                    label="Insuficiencia Cardiaca (IC)"
                                    value={this.state.result.IC} 
                                    onChange={this.handleValueChange}
                                    name='IC'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "IC sistólica"},
                                        {value: 2, label: "IC diastólica"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <DatePicker 
                                    label="Fecha de diagnóstico IC"
                                    value={this.state.result.fecha_dgtco_IC} 
                                    onChange={
                                        (isoString) => {
                                            
                                            var stateResult = this.state.result;
                                            stateResult.fecha_dgtco_IC = isoString;
                                            this.setState({result: stateResult});
                                        }}
                                    />    
                            </div>
                        </div>
                        <div className="row"> 
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="FA_input" 
                                    label="FA"
                                    value={this.state.result.FA} 
                                    onChange={this.handleValueChange}
                                    name='FA'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí, FA"},
                                        {value: 2, label: "Flutter"},
                                        {value: 3, label: "Taquicardia auricular"},
                                        {value: 4, label: "Taquicardia ventricular"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <DatePicker 
                                    label="Fecha de diagnóstico FA"
                                    value={this.state.result.fecha_dgtco_FA} 
                                    onChange={
                                        (isoString) => {
                                            
                                            var stateResult = this.state.result;
                                            stateResult.fecha_dgtco_FA = isoString;
                                            this.setState({result: stateResult});
                                        }}
                                    />    
                            </div>
                        </div>
                        <div className="row"> 
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="ictus_input" 
                                    label="Ictus"
                                    value={this.state.result.ictus} 
                                    onChange={this.handleValueChange}
                                    name='ictus'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "AIT"},
                                        {value: 2, label: "Ictus embólico"},
                                        {value: 3, label: "Ictus isquémico"},
                                        {value: 4, label: "Microvascular"},
                                        {value: 5, label: "Hemorrágico"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <DatePicker 
                                    label="Fecha de diagnóstico Ictus"
                                    value={this.state.result.fecha_dgtco_ictus} 
                                    onChange={
                                        (isoString) => {
                                            
                                            var stateResult = this.state.result;
                                            stateResult.fecha_dgtco_ictus = isoString;
                                            this.setState({result: stateResult});
                                        }}
                                    />    
                            </div>
                        </div>
                        <div className="row"> 
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="carotidas_input" 
                                    label="Carótidas"
                                    value={this.state.result.carotidas} 
                                    onChange={this.handleValueChange}
                                    name='carotidas'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí, sin TTO"},
                                        {value: 2, label: "Sí, con TTO intervencionista"},
                                        {value: 3, label: "Ictus isquémico"},
                                        {value: 4, label: "Microvascular"},
                                        {value: 5, label: "Hemorrágico"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <DatePicker 
                                    label="Fecha de diagnóstico carótidas"
                                    value={this.state.result.fecha_dgtco_carotidas} 
                                    onChange={
                                        (isoString) => {
                                            
                                            var stateResult = this.state.result;
                                            stateResult.fecha_dgtco_carotidas = isoString;
                                            this.setState({result: stateResult});
                                        }}
                                    />    
                            </div>
                        </div>
                        <div className="row"> 
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="claudicacion_intermitente_input" 
                                    label="Claudicación intermitente (CInt)"
                                    value={this.state.result.claudicacion_intermitente} 
                                    onChange={this.handleValueChange}
                                    name='claudicacion_intermitente'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí, sin intervencionismo"},
                                        {value: 2, label: "Sí, con intervencionismo"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <DatePicker 
                                    label="Fecha de diagnóstico CInt"
                                    value={this.state.result.fecha_dgtco_claudicacion} 
                                    onChange={
                                        (isoString) => {
                                            
                                            var stateResult = this.state.result;
                                            stateResult.fecha_dgtco_claudicacion = isoString;
                                            this.setState({result: stateResult});
                                        }}
                                    />    
                            </div>
                        </div>
                        <div className="row"> 
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="cardiop_isquemica_input" 
                                    label="Cardiopatía Isquemica (CI)"
                                    value={this.state.result.cardiop_isquemica} 
                                    onChange={this.handleValueChange}
                                    name='cardiop_isquemica'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Angina"},
                                        {value: 2, label: "Infarto"},
                                    ]}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <DatePicker 
                                    label="Fecha de diagnóstico CI"
                                    value={this.state.result.fecha_cardiop_isquemica} 
                                    onChange={
                                        (isoString) => {
                                            var stateResult = this.state.result;
                                            stateResult.fecha_cardiop_isquemica = isoString;
                                            this.setState({result: stateResult});
                                        }}
                                    />    
                            </div>
                        </div>
                        <div className="row"> 
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="disfuncionSexualInput" 
                                    label="Disfunción Sexual"
                                    value={this.state.result.disfuncionSexual} 
                                    onChange={this.handleValueChange}
                                    name='disfuncionSexual'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí"},
                                    ]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="soasInput" 
                                    label="SAOS"
                                    value={this.state.result.SAOS} 
                                    onChange={this.handleValueChange}
                                    name='SAOS'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí"},
                                    ]}
                                    />
                            </div>
                        </div>
                        <div className="row"> 
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="epocInput" 
                                    label="EPOC"
                                    value={this.state.result.EPOC} 
                                    onChange={this.handleValueChange}
                                    name='EPOC'
                                    options={[
                                        {value: 0, label: "No"},
                                        {value: 1, label: "Sí"},
                                    ]}
                                    />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-lg-3">
                                <SelectFieldGroup
                                    id="gradodEPOCInput" 
                                    label="Grado EPOC"
                                    value={this.state.result.gradodEPOC} 
                                    onChange={this.handleValueChange}
                                    name='gradodEPOC'
                                    options={[
                                        {value: 0, label: "-"},
                                        {value: 1, label: "I"},
                                        {value: 2, label: "II"},
                                        {value: 2, label: "III"},
                                        {value: 2, label: "IV"},
                                    ]}
                                    />
                            </div>
                        </div>
                    </div>
                )}
                
                {this.state.tabkey === "5" && (
                <div className="tab-content">
                    <div className='row'>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="analitica_basal_input" 
                                label="Analítica basal"
                                value={this.state.result.analitica_basal} 
                                onChange={this.handleValueChange}
                                name='analitica_basal'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"},
                                ]}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <DatePicker 
                                label="Fecha analítica"
                                value={this.state.result.fecha_analitica} 
                                onChange={
                                    (isoString) => {
                                        var stateResult = this.state.result;
                                        stateResult.fecha_analitica = isoString;
                                        this.setState({result: stateResult});
                                    }}
                                />    
                        </div>
                    </div>
                    <div className='row'>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="Hb_Input"
                                type="number"
                                label="Hb"
                                placeholder="Hb"
                                onChange={this.handleValueChange}
                                name='Hb'
                                value={this.state.result.hb}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="hcto_Input"
                                type="number"
                                label="Htco"
                                placeholder="Hcto"
                                onChange={this.handleValueChange}
                                name='hcto'
                                value={this.state.result.hcto}
                            />
                        </div> 
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="VCM_Input"
                                type="number"
                                label="VCM"
                                placeholder="VCM"
                                onChange={this.handleValueChange}
                                name='VCM'
                                value={this.state.result.VCM}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="CHCM_Input"
                                type="number"
                                label="CHCM"
                                placeholder="CHCM"
                                onChange={this.handleValueChange}
                                name='CHCM'
                                value={this.state.result.CHCM}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="plaquetas_Input"
                                type="number"
                                label="Plaquetas"
                                placeholder="Plaquetas"
                                onChange={this.handleValueChange}
                                name='plaquetas'
                                value={this.state.result.plaquetas}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="glucosa_Input"
                                type="number"
                                label="Glucosa"
                                placeholder="Glucosa"
                                onChange={this.handleValueChange}
                                name='glucosa'
                                value={this.state.result.glucosa}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="hb1Ac_Input"
                                type="number"
                                label="hb1Ac"
                                placeholder="hb1Ac"
                                onChange={this.handleValueChange}
                                name='hb1Ac'
                                value={this.state.result.hb1Ac}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="urea_Input"
                                type="number"
                                label="Urea"
                                placeholder="Urea"
                                onChange={this.handleValueChange}
                                name='urea'
                                value={this.state.result.urea}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="creatinina_Input"
                                type="number"
                                label="Creatinina"
                                placeholder="Creatinina"
                                onChange={this.handleValueChange}
                                name='creatinina'
                                value={this.state.result.creatinina}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="FG_Input"
                                type="number"
                                label="FG"
                                placeholder="FG"
                                onChange={this.handleValueChange}
                                name='FG'
                                value={this.state.result.FG}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="Na_Input"
                                type="number"
                                label="Na"
                                placeholder="Na"
                                onChange={this.handleValueChange}
                                name='Na'
                                value={this.state.result.Na}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="K_Input"
                                type="number"
                                label="K"
                                placeholder="K"
                                onChange={this.handleValueChange}
                                name='K'
                                value={this.state.result.K}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="GOT_Input"
                                type="number"
                                label="GOT"
                                placeholder="GOT"
                                onChange={this.handleValueChange}
                                name='GOT'
                                value={this.state.result.GOT}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="GPT_Input"
                                type="number"
                                label="GPT"
                                placeholder="GPT"
                                onChange={this.handleValueChange}
                                name='GPT'
                                value={this.state.result.GPT}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="GGT_Input"
                                type="number"
                                label="GGT"
                                placeholder="GGT"
                                onChange={this.handleValueChange}
                                name='GGT'
                                value={this.state.result.GGT}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="CT_Input"
                                type="number"
                                label="CT"
                                placeholder="CT"
                                onChange={this.handleValueChange}
                                name='CT'
                                value={this.state.result.CT}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="LDL_Input"
                                type="number"
                                label="LDL"
                                placeholder="LDL"
                                onChange={this.handleValueChange}
                                name='LDL'
                                value={this.state.result.LDL}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="HDL_Input"
                                type="number"
                                label="HDL"
                                placeholder="HDL"
                                onChange={this.handleValueChange}
                                name='HDL'
                                value={this.state.result.HDL}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="TG_Input"
                                type="number"
                                label="TG"
                                placeholder="TG"
                                onChange={this.handleValueChange}
                                name='TG'
                                value={this.state.result.TG}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="microalbuminuria_Input"
                                type="number"
                                label="Microalbuminuria"
                                placeholder="Microalbuminuria"
                                onChange={this.handleValueChange}
                                name='microalbuminuria'
                                value={this.state.result.microalbuminuria}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="cociente_alb_cr_Input"
                                type="number"
                                label="Cociente Alb/cr"
                                placeholder="Cociente Alb/cr"
                                onChange={this.handleValueChange}
                                name='cociente_alb_cr'
                                value={this.state.result.cociente_alb_cr}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="proteinuria_Input"
                                type="number"
                                label="Proteinuria"
                                placeholder="Proteinuria"
                                onChange={this.handleValueChange}
                                name='proteinuria'
                                value={this.state.result.proteinuria}
                            />
                        </div>
                    </div>
                   
                </div>
                )}
                {this.state.tabkey === "6" && (
                <div className="tab-content">
                    <div className='row'>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="MAPA_reciente_input" 
                                label="Mapa Reciente?"
                                value={this.state.result.mapa_reciente} 
                                onChange={this.handleValueChange}
                                name='mapa_reciente'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"},
                                ]}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="mapa_diurna_Input"
                                type="number"
                                label="Mapa Diurna"
                                placeholder="Mapa Diurna"
                                onChange={this.handleValueChange}
                                name='mapa_diurna'
                                value={this.state.result.mapa_diurna}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="mapa_nocturno_Input"
                                type="number"
                                label="Mapa Nocturno"
                                placeholder="Mapa Nocturno"
                                onChange={this.handleValueChange}
                                name='mapa_nocturno'
                                value={this.state.result.mapa_nocturno}
                            />
                        </div>

                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="dip_Input"
                                type="number"
                                label="Dip"
                                placeholder="Dip"
                                onChange={this.handleValueChange}
                                name='dip'
                                value={this.state.result.dip}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="ecocardio_input" 
                                label="Ecocardio"
                                value={this.state.result.ecocardio} 
                                onChange={this.handleValueChange}
                                name='ecocardio'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"},
                                ]}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <DatePicker 
                                label="Fecha Ecocardio"
                                value={this.state.result.fecha_ecocardio} 
                                onChange={
                                    (isoString) => {
                                        var stateResult = this.state.result;
                                        stateResult.fecha_ecocardio = isoString;
                                        this.setState({result: stateResult});
                                    }}
                                />    
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="DTDVI_Input"
                                type="number"
                                label="DTDVI"
                                placeholder="DTDVI"
                                onChange={this.handleValueChange}
                                name='DTDVI'
                                value={this.state.result.DTDVI}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="septo_Input"
                                type="number"
                                label="Septo"
                                placeholder="Septo"
                                help="Grosor del septo"
                                onChange={this.handleValueChange}
                                name='septo'
                                value={this.state.result.septo}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="masa_Input"
                                type="number"
                                label="Masa"
                                placeholder="Masa"
                                onChange={this.handleValueChange}
                                name='masa'
                                value={this.state.result.masa}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="AI_Input"
                                type="number"
                                label="AI"
                                placeholder="AI"
                                onChange={this.handleValueChange}
                                name='AI'
                                value={this.state.result.AI}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="FEVI_Input"
                                type="number"
                                label="FEVI"
                                placeholder="FEVI"
                                onChange={this.handleValueChange}
                                name='FEVI'
                                value={this.state.result.FEVI}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="diastole_input" 
                                label="Diástole"
                                value={this.state.result.diastole} 
                                onChange={this.handleValueChange}
                                name='diastole'
                                options={[
                                    {value: 0, label: "Normal"},
                                    {value: 1, label: "Alteración relajación"},
                                    {value: 2, label: "Pseudonormal"},
                                    {value: 3, label: "Restrictivo reversible"},
                                    {value: 4, label: "Restrictivo irreversible"},
                                ]}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="valvulopatia_input" 
                                label="Valvulopatía"
                                value={this.state.result.valvulopatia} 
                                onChange={this.handleValueChange}
                                name='valvulopatia'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "EAO lig"},
                                    {value: 2, label: "IAO lig"},
                                    {value: 3, label: "EAO mod"},
                                    {value: 4, label: "IAO mod"},
                                    {value: 5, label: "EAO sev"},
                                    {value: 6, label: "IAO sev"},
                                    {value: 7, label: "EM lig"},
                                    {value: 8, label: "IM lig"},
                                    {value: 9, label: "EM mod"},
                                    {value: 10, label: "IM mod"},
                                    {value: 11, label: "EM sev"},
                                    {value: 12, label: "IM sev"},
                                    {value: 13, label: "IT lig"},
                                    {value: 14, label: "IT mod"},
                                    {value: 15, label: "IT sev"},
                                ]}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="fondo_ojo_input" 
                                label="Fondo ojo"
                                value={this.state.result.fondo_ojo} 
                                onChange={this.handleValueChange}
                                name='fondo_ojo'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"},
                                ]}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <DatePicker 
                                label="Fecha Fondo Ojo"
                                value={this.state.result.fecha_fondo_ojo} 
                                onChange={
                                    (isoString) => {
                                        var stateResult = this.state.result;
                                        stateResult.fecha_fondo_ojo = isoString;
                                        this.setState({result: stateResult});
                                    }}
                                />    
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="fondo_ojo_patol_input" 
                                label="Fondo ojo patológico"
                                value={this.state.result.fondo_ojo_patologico} 
                                onChange={this.handleValueChange}
                                name='fondo_ojo_patologico'
                                options={[
                                    {value: 0, label: "Normal"},
                                    {value: 1, label: "Retinopatía grado 1"},
                                    {value: 2, label: "Retinopatía grado 2"},
                                    {value: 3, label: "Retinopatía grado 3"},
                                ]}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="renal_estudio_input" 
                                label="Estudio Renal"
                                value={this.state.result.renal_estudio} 
                                onChange={this.handleValueChange}
                                name='renal_estudio'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"},
                                ]}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="patologia_renal_input" 
                                label="Patología Renal"
                                value={this.state.result.patologia_renal} 
                                onChange={this.handleValueChange}
                                name='patologia_renal'
                                options={[
                                    {value: 0, label: "No"},
                                    {value: 1, label: "Sí"},
                                ]}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <FieldGroup
                                id="cual_patologia_renal_Input"
                                type="text"
                                label="Qué patología renal?"
                                placeholder="Qué patología renal?"
                                onChange={this.handleValueChange}
                                name='cual_patologia_renal'
                                value={this.state.result.cual_patologia_renal}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-lg-3">
                            <SelectFieldGroup
                                id="proteinuria_input" 
                                label="Proteinuria"
                                value={this.state.result.proteinuria} 
                                onChange={this.handleValueChange}
                                name='proteinuria'
                                options={[
                                    {value: 0, label: "Negativo"},
                                    {value: 1, label: "Microalbuminuria"},
                                    {value: 2, label: "Proteinuria"},
                                    {value: 3, label: "Rango nefrótica"},
                                ]}
                            />
                        </div>
                    </div>
                </div>
                )}
                <div className="row btns top">
                    <div className="col-xs-12 col-sm-4 col-sm-offset-8 col-md-4 col-md-offset-8 col-lg-3 col-lg-offset-9">
                        <Button bsStyle="success" block={true} onClick={this.save}>Guardar</Button>
                    </div>
                </div>
            </div>
        );
        return result;
    }
   
}

