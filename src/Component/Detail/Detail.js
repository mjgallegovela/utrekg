import React from 'react';
import './Detail.css';
import {Button, Nav, NavItem, Glyphicon, ControlLabel} from 'react-bootstrap';
//import Result from '../../Model/result';

import Customer from '../../Model/Customer';
import Session from '../../Model/Session';

import { map } from 'lodash';
import DatePicker from '../Form/DatePicker/DatePicker';
import FieldGroup from '../Form/FieldGroup';
import SelectFieldGroup from '../Form/SelectFieldGroup';
import CustomModal from '../Form/Modal/CustomModal';
import Dictionary from '../../Provider/Dictionary';
import {customerToCSV} from '../../Provider/Export';

var moment = require('moment');

export default class Detail extends React.Component {
    constructor(props) {
        super(props);
        this.calculatedValues = this.calculatedValues.bind(this);
        this.save = this.save.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.handleCustomerValueChange = this.handleCustomerValueChange.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.resetState = this.resetState.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.newSession = this.newSession.bind(this);
        this.handleSessionValueChange = this.handleSessionValueChange.bind(this);
        this.saveSessions = this.saveSessions.bind(this);
        this.openFile = this.openFile.bind(this);
        this.uploadEkg = this.uploadEkg.bind(this);
        this.removeEkg = this.removeEkg.bind(this);
        this.setDateTimeValueCurrentVisit = this.setDateTimeValueCurrentVisit.bind(this);
        this.removeCurrentSession = this.removeCurrentSession.bind(this);
        this.deleteCustomer = this.deleteCustomer.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        
        this.state = {
            exists: this.props.exists === 'true',
            loaded: false,
            result: new Customer(), 
            visit: 0,
            visits: [],
            id: this.props.id!== undefined? this.props.id: null, 
            message: {txt: "", type: "info", showClose: false},
            tabkey: "1" ,
            
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
            var docRef = this.props.fb.firestore().collection("customers").doc(this.state.id);
            var that = this;
            docRef.get().then(function(doc) {
                let customer = doc.data();
                console.log("Carga el customer");
                that.props.fb.firestore().collection("sessions").where("customer", "==", that.state.id).orderBy("fecha_visita").get()
                    .then(querySnapshot => {
                        console.log("Carga las sessions");
                        let visitCollection = [];
                        let visitModel = new Session();
                        querySnapshot.forEach(doc => {
                            let visit = doc.data();
                            map(visitModel, (value, key) => {
                                // Predefined values in model
                                if(visit[key] ===  undefined) {
                                    visit[key] = value;
                                }
                            });
                            visitCollection.push(visit);
                        });

                        that.setState({
                            result: customer, 
                            visits: visitCollection,
                            visit: (visitCollection.length <= 0)?0:(visitCollection.length - 1),
                            message: {txt: "", type: "info", showClose: false}
                        }, () => that.calculatedValues());
                    }).catch( errorSessions => {
                        console.log("Error cargando sessions");
                        console.log(errorSessions);
                    });
            }).catch(function(error) {
                console.log(error);
                that.setState({
                    result: new Customer(), 
                    visits: [], 
                    visit: 0,
                    message: {txt: "El documento que está intentando cargar no existe.", type: "error", showClose: true, exists: false}
                });
            });
        } else {
            this.setState({result: new Customer(), visits: [], visit: 0});
        }
    }

    exportCSV() {
        var file = customerToCSV(this.state.result, this.state.visits)
        window.open(URL.createObjectURL(file), 'ExportFile');
    }

    save() {
        this.showMessage("Guardando...", "info", false);
        let currentState = this.state.result;
        var result = {};
        map(currentState, (value, key) => {
            result[key] = value;
        });
        result.apellidosearch = (result.apellido1 !== undefined && result.apellido1 !== null)?result.apellido1.toLowerCase():"";
        this.setState({result: currentState});
        var that = this;
        if(this.state.exists){
            this.props.fb.firestore().collection("customers").doc(this.state.id).set(result)
            .then(function(docRef) {
                that.saveSessions(that.state.id, () => { that.showMessage("Guardado con éxito", "success", true); } );
            })
            .catch(function(error) {
                that.showMessage("Error al guardar, inténtalo de nuevo", "error", true);
                console.log(error);
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
                    this.props.fb.firestore().collection("customers").doc(strId).set(result)
                    .then(() => {
                        that.setState({
                            id: strId,
                            exists: true,
                            result: result,
                            message: { txt: "Guardado con éxito", type: "success", showClose: true, closeCallback: () => {} }
                        });
                    }).catch((error) => {
                        that.showMessage("Error al guardar, inténtalo de nuevo", "danger", true);
                        console.log(error);
                    });
                })
            })
        }
    }

    saveSessions(customerId, callback) {
        let total = this.state.visits.length;
        let saved = 0;
        if(this.state.visits.length <= 0) {
            callback();
        } else {
            map(this.state.visits, (session, key) => {
                var sessionRawObject = {};
                map(session, (propertyValue, key) => {
                    sessionRawObject[key] = propertyValue;
                });
                sessionRawObject.customer = customerId;
                this.props.fb.firestore().collection("sessions").doc(session.id).set(sessionRawObject).then(() =>{
                    if(++saved >= total) {
                        callback();
                    }
                });
            });
        }
        
    }

    handleCustomerValueChange(event) {
        var newState = this.state.result;
        newState[event.target.name] = event.target.value;
        this.setState({result: newState});
    }

    handleValueChange(event) {
        var newState = this.state.visits;
        newState[this.state.visit][event.target.name] = event.target.value;
        this.setState({visits: newState});
        this.calculatedValues();
    }
    
    handleSessionValueChange(event) {
        console.log("nueva session: " + event.target.value)
        this.setState({visit: event.target.value});
    }

    handleSelect(eventKey) {
        this.setState({tabkey: eventKey});
    }

    resetState(props) {
        this.setState({
            exists: props.exists === 'true',
            loaded: false,
            id: this.props.id!== undefined? this.props.id: null, 
            message: {txt: "", type: "info", showClose: false},
            tabkey: "1",
            result: new Customer(), 
            visit: 0,
            visits: []
        });
    }

    newSession() {
        let newSession = new Session();
        newSession.creatorUser = this.props.fb.auth().currentUser.email;
        newSession.id =  this.state.id + "_" + moment().format("YYYYMMDDHHmmss");
        let sessions = this.state.visits;
        sessions.push(newSession);
        var that = this;
        this.setState({visits: sessions, visit: sessions.length-1}, () => {
            that.showMessage("Visita creada.  Recuerde que debe guardar los cambios antes de salir del detalle del paciente.", "success", true)
        });
    }
    
    removeCurrentSession() {
        var that = this;
        this.setState({
            message: {
                txt: "Esta operación no se puede deshacer, ¿está seguro de querer continuar?", 
                type: "default", 
                acceptCancel: true, 
                handleAccept: () => {
                    var visitList = that.state.visits;
                    var newVisitList =  [];
                    var found = false;
                    var iter = 0;
                    var sessionToRemove = null;
                    visitList.forEach(visit => {
                        if(found || that.state.visit !== iter) {
                            newVisitList.push(visit);
                        } else {
                            sessionToRemove = visit;
                        }
                        found = that.state.visit === iter++;
                    });

                    that.props.fb.firestore().collection("sessions").doc(sessionToRemove.id).delete().then(() =>{
                        that.setState({visit: 0, visits: newVisitList});
                        that.showMessage("Visita borrada con exito", "success", true);
                    });
                    
                },
                handleCancel: () => {
                    that.setState({message: {txt: "", type: "info", showClose: false, closeCallback: undefined}});
                }
            }
        });
    }

    deleteCustomer() {
        var that = this;

        if(this.state.exists){
            this.setState({
                message: {
                    txt: "¿Estás seguro de querer borrar este usuario?", 
                    type: "default", 
                    acceptCancel: true, 
                    handleAccept: () => {
                        var id = that.state.id;
                        that.showMessage("Borrando paciente...", "info", false);
                        that.props.fb.firestore().collection("customers").doc(id).delete().then(function() {
                            that.showMessage("Se ha borrado el usuario", "success", true, () => window.location = "/");
                        }).catch(function(error) {
                            that.showMessage("Se produjo un error, inténtalo de nuevo.", "danger", true, () => that.refresh());
                        });
                    },
                    handleCancel: () => {
                        that.setState({message: {txt: "", type: "info", showClose: false, closeCallback: undefined}});
                    }
                }
            });
        } else {
            this.showMessage("No puede borrar un usuario hasta que no lo guarde previamente", "danger", false);
        }
    }

    showMessage(txt, type, showClose, closeCallback){
        this.setState({message: {txt: txt, type: type, showClose: showClose, closeCallback: closeCallback}});
    }

    handleCloseModal() {
        var callback = this.state.message.closeCallback ? this.state.message.closeCallback : () => {};
        this.setState(
            {message: {txt: "", type: "info", showClose: false}}, 
            callback()
        );
    }

    setDateTimeValueCurrentVisit(key, value) {
        var visits = this.state.visits;
        visits[this.state.visit][key] = value;
        this.setState({visits: visits});
    }

    openFile() {
        this.fileEkg.click();
    }

    uploadEkg() {
        this.showMessage("Subiendo archivo...", "info", false);
        var that = this;
        let file = this.fileEkg.files[0];

        let storage = this.props.fb.storage();
        // Create a storage reference from our storage service
        let storageRef = storage.ref();
        // Child references can also take paths delimited by '/'
        let ekgImgRef = storageRef.child('ekgs/' + this.state.visits[this.state.visit].id + '.jpg');

        ekgImgRef.put(file).then(snapshot => {
            ekgImgRef.getDownloadURL().then( url =>  {
                that.state.visits[that.state.visit].ekg_img = url;
                that.showMessage("", "info", false);
            });
        }).catch(error => {
            that.showMessage("Ocurrio un error al subir el archivo.  Por favor, inténtelo de nuevo.", "danger", true);
        });
    }

    removeEkg() {
        const visits = this.state.visits;
        visits[this.state.visit].ekg_img = "";
        this.setState({visits: visits});
    }

    calculatedValues() {
        
        if(this.state !== undefined && this.state.visits.length > 0) {
            // IMC
            var newState = this.state.visits;
            let currentState = this.state.visit;
            let peso = parseFloat(newState[currentState].peso);
            let altura = parseFloat(newState[currentState].altura);

            if(!isNaN(altura) && altura > 0) {
                newState[this.state.visit].IMC= (peso / (altura / 100) * (altura/100)).toFixed(2);
                console.log("IMC: " + newState[this.state.visit].IMC);
            } else {
                newState[this.state.visit].IMC = "";
            }

            // filtrado glomerular (FG) en AP
            var momentBirth = moment(new Date(this.state.result.fecha_nacimiento));
            var edad = moment(new Date(newState[currentState].fecha_visita)).diff(momentBirth, 'years');
            var coef = 1;
            if(this.state.result.sexo === "M") {
                coef = .85;
            }
            newState[currentState].FG = (coef * peso * (140-edad)/(72*newState[currentState].creatinina)).toFixed(2);
            console.log("FG: " + newState[this.state.visit].FG);
            this.setState({visits: newState});
        }
    }

    render() {
        
        let visitsOptions = [];
        let index = 1;

        map(this.state.visits, (value, key) => {
            index = (key + 1);
            let momentDate = moment(new Date(value.fecha_visita));
            visitsOptions.push({value: key, label: index + "ª visita (" + momentDate.format("DD-MM-YYYY") + " - " + value.creatorUser + ")"},)
        });

        var dictionaryOptionsLists = {};
        for(var dictionaryKey in Dictionary) {
            if(dictionaryOptionsLists[dictionaryKey] === undefined) {
                dictionaryOptionsLists[dictionaryKey] = [];
            }
            for(index in Dictionary[dictionaryKey]) {
                dictionaryOptionsLists[dictionaryKey].push({ value: index, label: Dictionary[dictionaryKey][index] });
            }
        }
        if(this.state.visits.length > 0) {
            console.log(this.state.visits[this.state.visit]);
        }

        const result = (
            <div>
                <div className="pageTitle">
                    <h3 className={'teal-text'}>{this.state.exists ? 'Editar Usuario: ' + this.state.id : 'Crear Nuevo Usuario'}</h3>
                </div>
                <CustomModal handleCloseModal={this.handleCloseModal} message={this.state.message} />
                {!this.state.exists && (
                    <div className="row btns">
                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-3">
                        {this.state.exists ? 'Creado por: ' + this.state.result.creatorUser : ''}
                    </div>
                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-6"></div>
                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-3">
                        <Button bsStyle="success" block={true} onClick={this.save}><Glyphicon glyph="floppy-disk"/> Guardar</Button>
                    </div>
                </div>
                )}
                {this.state.exists && (
                    <div className="row btns">
                        <div className="col-xs-12 col-sm-4 col-md-4 col-lg-3">
                            {this.state.exists ? 'Creado por: ' + this.state.result.creatorUser : ''}
                        </div>
                        <div className="col-xs-12 col-xs-offset-0 col-sm-4 col-md-4 col-lg-3 col-lg-offset-3">
                            <Button bsStyle="success" block={true} onClick={this.save}><Glyphicon glyph="floppy-disk"/> Guardar</Button>
                        </div>
                        <div className="col-xs-12 col-sm-4 col-md-4 col-lg-3">
                            <Button bsStyle="danger" block={true} onClick={this.deleteCustomer}><Glyphicon glyph="trash"/> Eliminar</Button>
                        </div>
                        <div className="col-xs-12 col-xs-offset-0 col-sm-4 col-sm-offset-8 col-md-4 col-lg-offset-9 col-lg-3 text-right">
                            <Button bsStyle="primary" block={true} onClick={this.exportCSV}><Glyphicon glyph="download-alt"/> Exportar</Button>
                        </div>
                    </div>
                )}
                <div className='row'>
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                        <FieldGroup
                            id="identificacionInput"
                            type="text"
                            label="Identificación"
                            placeholder="Identificación"
                            onChange={this.handleCustomerValueChange}
                            name='identificacion'
                            value={this.state.result.identificacion}
                            className={"mayus"}
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
                            onChange={this.handleCustomerValueChange}
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
                            onChange={this.handleCustomerValueChange}
                            name='apellido1'
                            value={this.state.result.apellido1}
                            />
                    </div>
                    <div className="col-xs-12 col-xs-offset-0 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4 col-lg-4 col-lg-offset-0">
                        <FieldGroup
                            id="apellido2Input"
                            type="text"
                            label="Segundo apellido"
                            placeholder="Segundo apellido"
                            onChange={this.handleCustomerValueChange}
                            name='apellido2'
                            value={this.state.result.apellido2}
                            />
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
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
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                        <SelectFieldGroup
                            id="sexoInput" 
                            label="Sexo"
                            value={this.state.result.sexo} 
                            onChange={this.handleCustomerValueChange}
                            name='sexo'
                            options={[{value: "H", label: "Hombre"},{value: "M", label: "Mujer"}]}
                            />
                    </div>
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                        <FieldGroup
                            id="edad_inclusionInput"
                            type="number"
                            label="Edad inclusion"
                            placeholder="Edad inclusion"
                            onChange={this.handleCustomerValueChange}
                            name='edad_inclusion'
                            value={this.state.result.edad_inclusion}
                            />
                    </div>
                </div>
                
                {this.state.visits.length > 0 && (
                    <div>
                        <div className="pageTitle">
                            <h3 className={'teal-text'}>Visitas</h3>
                        </div>
                        <div className="row">
                            <div className="col-xs-8 col-sm-8 col-md-8 col-lg-6">
                                <SelectFieldGroup
                                    id="visitaInput" 
                                    label="Visita"
                                    value={this.state.visit} 
                                    onChange={this.handleSessionValueChange}
                                    name='visita'
                                    options={visitsOptions}
                                    />
                            </div>
                            <div className="col-xs-2 col-sm-2 col-md-4 col-lg-3">
                                <ControlLabel>&nbsp;</ControlLabel>
                                <Button bsStyle="primary" block={true} onClick={this.newSession}><Glyphicon glyph="plus"/><span className="hidden-xs hidden-sm"> Nueva visita</span></Button>
                            </div>
                            <div className="col-xs-2 col-xs-offset-0 col-sm-2 col-md-4 col-md-offset-8 col-lg-3 col-lg-offset-0">
                                <ControlLabel>&nbsp;</ControlLabel>
                                <Button bsStyle="danger" block={true} onClick={this.removeCurrentSession}><Glyphicon glyph="trash"/><span className="hidden-xs hidden-sm"> Eliminar esta visita</span></Button>
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
                            <NavItem eventKey="7">
                                PLAN
                            </NavItem>
                        </Nav>
                    
                        {this.state.tabkey === "1" && (
                            /* DATOS PERSONALES */
                            <div className="tab-content">
                                <div className='row'>
                                    
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <FieldGroup
                                            id="pesoInput"
                                            type="number"
                                            label="Peso (Kg)"
                                            placeholder="Peso (Kg)"
                                            onChange={this.handleValueChange}
                                            name='peso'
                                            value={this.state.visits[this.state.visit].peso}
                                            />
                                    </div>
                                    
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <FieldGroup
                                            id="pesoInput"
                                            type="number"
                                            label="Altura (cm)"
                                            placeholder="Altura (cm)"
                                            onChange={this.handleValueChange}
                                            name='altura'
                                            value={this.state.visits[this.state.visit].altura}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <FieldGroup
                                            id="imcInput"
                                            type="number"
                                            label="IMC"
                                            placeholder="IMC"
                                            disabled="disabled"
                                            onChange={this.handleValueChange}
                                            name='IMC'
                                            value={this.state.visits[this.state.visit].IMC}
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
                                            value={this.state.visits[this.state.visit].perimetro_torax}
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
                                            value={this.state.visits[this.state.visit].perimetro_abd}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <SelectFieldGroup
                                            id="pnormalInput" 
                                            label="Pectus Normal"
                                            value={this.state.visits[this.state.visit].pectus_normal} 
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
                                            value={this.state.visits[this.state.visit].TAS_MSD}
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
                                            value={this.state.visits[this.state.visit].TAD_MSD}
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
                                            value={this.state.visits[this.state.visit].TAS_MSI}
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
                                            value={this.state.visits[this.state.visit].TAD_MSI}
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
                                            value={this.state.visits[this.state.visit].expl_patolog}
                                            />
                                    </div>
                                </div>
                            </div>
                        )}
                        {this.state.tabkey === "2" && (
                            /* TTO */
                            <div className="tab-content">
                                <div className='row'>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="iecaInput" 
                                            label="IECA"
                                            value={this.state.visits[this.state.visit].IECA} 
                                            onChange={this.handleValueChange}
                                            name='IECA'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="tipo_predef_IECA_Input" 
                                            label="Tipo IECA"
                                            value={this.state.visits[this.state.visit].tipo_predef_IECA} 
                                            onChange={this.handleValueChange}
                                            name='tipo_predef_IECA'
                                            options={dictionaryOptionsLists.tipo_predef_IECA}
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
                                            value={this.state.visits[this.state.visit].dosis_IECA}
                                        />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="ARA_IIInput" 
                                            label="ARA II"
                                            value={this.state.visits[this.state.visit].ARA_II} 
                                            onChange={this.handleValueChange}
                                            name='ARA_II'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="tipo_predef_ARA_IIInput" 
                                            label="Tipo ARA II"
                                            value={this.state.visits[this.state.visit].tipo_predef_ARA_II} 
                                            onChange={this.handleValueChange}
                                            name='tipo_predef_ARA_II'
                                            options={dictionaryOptionsLists.tipo_predef_ARA_II}
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
                                            value={this.state.visits[this.state.visit].dosis_ARA_II}
                                        />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="DIU_TIAZInput" 
                                            label="DIU TIAZ"
                                            value={this.state.visits[this.state.visit].DIU_TIAZ} 
                                            onChange={this.handleValueChange}
                                            name='DIU_TIAZ'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="tipo_predef_DIU_TIAZInput" 
                                            label="Tipo DIU TIAZ"
                                            value={this.state.visits[this.state.visit].tipo_predef_DIU_TIAZ} 
                                            onChange={this.handleValueChange}
                                            name='tipo_predef_DIU_TIAZ'
                                            options={dictionaryOptionsLists.tipo_predef_DIU_TIAZ}
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
                                            value={this.state.visits[this.state.visit].dosis_DIU_TIAZ}
                                        />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="ACA_DHPInput" 
                                            label="ACA DHP"
                                            value={this.state.visits[this.state.visit].ACA_DHP} 
                                            onChange={this.handleValueChange}
                                            name='ACA_DHP'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="tipo_predef_ACA_DHP_Input" 
                                            label="Tipo ACA DHP"
                                            value={this.state.visits[this.state.visit].tipo_predef_ACA_DHP} 
                                            onChange={this.handleValueChange}
                                            name='tipo_predef_ACA_DHP'
                                            options={dictionaryOptionsLists.tipo_predef_ACA_DHP}
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
                                            value={this.state.visits[this.state.visit].dosis_ACA_DHP}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="verap_diltInput" 
                                            label="Verap Dilt"
                                            value={this.state.visits[this.state.visit].verap_dilt} 
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
                                            value={this.state.visits[this.state.visit].dosis_verap_dilt}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="alfabloqInput" 
                                            label="Alfabloq"
                                            value={this.state.visits[this.state.visit].alfabloq} 
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
                                            value={this.state.visits[this.state.visit].cual_alfabloq}
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
                                            value={this.state.visits[this.state.visit].dosis_alfabloq}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="betabloqInput" 
                                            label="Betabloq"
                                            value={this.state.visits[this.state.visit].betabloq} 
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
                                            value={this.state.visits[this.state.visit].cual_betabloq}
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
                                            value={this.state.visits[this.state.visit].dosis_betabloq}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="aldost_inhInput" 
                                            label="ALDOST INH"
                                            value={this.state.visits[this.state.visit].aldost_inh} 
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
                                            value={this.state.visits[this.state.visit].cual_aldost_inh}
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
                                            value={this.state.visits[this.state.visit].dosis_aldost_inh}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="diu_asa_input" 
                                            label="DIU ASA"
                                            value={this.state.visits[this.state.visit].diu_asa} 
                                            onChange={this.handleValueChange}
                                            name='diu_asa'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="tipo_predef_diu_asa_Input" 
                                            label="Tipo Diu ASA"
                                            value={this.state.visits[this.state.visit].tipo_predef_diu_asa} 
                                            onChange={this.handleValueChange}
                                            name='tipo_predef_diu_asa'
                                            options={dictionaryOptionsLists.tipo_predef_diu_asa}
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
                                            value={this.state.visits[this.state.visit].dosis_diu_asa}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="diu_aho_k_input" 
                                            label="DIU Ahorrador Potasio"
                                            value={this.state.visits[this.state.visit].diu_aho_k} 
                                            onChange={this.handleValueChange}
                                            name='diu_aho_k'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="tipo_predef_aho_k_Input" 
                                            label="Tipo Ahorrador Potasio"
                                            value={this.state.visits[this.state.visit].tipo_predef_aho_k} 
                                            onChange={this.handleValueChange}
                                            name='tipo_predef_aho_k'
                                            options={dictionaryOptionsLists.tipo_predef_aho_k}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="dosis_diu_aho_k_input"
                                            type="number"
                                            label="Dosis Ahorrador Potasio"
                                            placeholder="Dosis Ahorrador Potasio"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='dosis_diu_aho_k'
                                            value={this.state.visits[this.state.visit].dosis_diu_aho_k}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="aliskiren_input" 
                                            label="Aliskiren"
                                            value={this.state.visits[this.state.visit].aliskiren} 
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
                                            value={this.state.visits[this.state.visit].dosis_aliskiren}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="ACO_input" 
                                            label="ACO"
                                            value={this.state.visits[this.state.visit].ACO} 
                                            onChange={this.handleValueChange}
                                            name='ACO'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="tipo_predef_acos_Input" 
                                            label="Tipo ACO"
                                            value={this.state.visits[this.state.visit].tipo_predef_acos} 
                                            onChange={this.handleValueChange}
                                            name='tipo_predef_acos'
                                            options={dictionaryOptionsLists.tipo_predef_acos}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <FieldGroup
                                            id="dosis_acos_input"
                                            type="number"
                                            label="Dosis ACO"
                                            placeholder="Dosis ACO"
                                            onChange={this.handleValueChange}
                                            name='dosis_acos'
                                            value={this.state.visits[this.state.visit].dosis_acos}
                                        />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="ESTATINAS_input" 
                                            label="Estatinas"
                                            value={this.state.visits[this.state.visit].ESTATINAS} 
                                            onChange={this.handleValueChange}
                                            name='ESTATINAS'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="tipo_predef_estatinas_Input" 
                                            label="Tipo Estatinas"
                                            value={this.state.visits[this.state.visit].tipo_predef_estatinas} 
                                            onChange={this.handleValueChange}
                                            name='tipo_predef_estatinas'
                                            options={dictionaryOptionsLists.tipo_predef_estatinas}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <FieldGroup
                                            id="dosis_estatinas_input"
                                            type="number"
                                            label="Dosis Estatinas"
                                            placeholder="Dosis Estatinas"
                                            onChange={this.handleValueChange}
                                            name='dosis_estatinas'
                                            value={this.state.visits[this.state.visit].dosis_estatinas}
                                        />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="INSULINA_input" 
                                            label="Insulina"
                                            value={this.state.visits[this.state.visit].INSULINA} 
                                            onChange={this.handleValueChange}
                                            name='INSULINA'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="INSULINA_DOSIS_input"
                                            type="number"
                                            label="Dosis Insulina"
                                            placeholder="Dosis Insulinao"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='INSULINA_DOSIS'
                                            value={this.state.visits[this.state.visit].INSULINA_DOSIS}
                                        />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="INSULINA_RAPIDA_input" 
                                            label="Insulina Rápida"
                                            value={this.state.visits[this.state.visit].INSULINA_RAPIDA} 
                                            onChange={this.handleValueChange}
                                            name='INSULINA_RAPIDA'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="INSULINA_RAPIDA_DOSIS_input"
                                            type="number"
                                            label="Dosis Insulina Rápida"
                                            placeholder="Dosis Insulinao"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='INSULINA_RAPIDA_DOSIS'
                                            value={this.state.visits[this.state.visit].INSULINA_RAPIDA_DOSIS}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="antiagregantes_input" 
                                            label="Antiagregantes"
                                            value={this.state.visits[this.state.visit].antiagregantes} 
                                            onChange={this.handleValueChange}
                                            name='antiagregantes'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <FieldGroup
                                            id="tipo_antiagregantes_input"
                                            label="Tipo Antiagregantes"
                                            placeholder="Tipo Antiagregantes"
                                            onChange={this.handleValueChange}
                                            name='tipo_antiagregantes'
                                            value={this.state.visits[this.state.visit].tipo_antiagregantes}
                                        />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="dosis_antiagregantes_input"
                                            type="number"
                                            label="Dosis Antiagregantes"
                                            placeholder="Dosis Antiagregantes"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='dosis_antiagregantes'
                                            value={this.state.visits[this.state.visit].dosis_antiagregantes}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="AAS_input" 
                                            label="AAS"
                                            value={this.state.visits[this.state.visit].AAS} 
                                            onChange={this.handleValueChange}
                                            name='AAS'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="AAS_input"
                                            type="number"
                                            label="Dosis AAS"
                                            placeholder="Dosis AAS"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='AAS_DOSIS'
                                            value={this.state.visits[this.state.visit].AAS_DOSIS}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="clopidogrel_input" 
                                            label="Clopidogrel"
                                            value={this.state.visits[this.state.visit].clopidogrel} 
                                            onChange={this.handleValueChange}
                                            name='clopidogrel'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="clopidogrel_dosis_input"
                                            type="number"
                                            label="Dosis Clopidogrel"
                                            placeholder="Dosis Clopidogrel"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='clopidogrel_dosis'
                                            value={this.state.visits[this.state.visit].clopidogrel_dosis}
                                        />
                                    </div>
                                </div>
                                <div className='row'>                                        
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="METFORMINA_input" 
                                            label="Metformina"
                                            value={this.state.visits[this.state.visit].METFORMINA} 
                                            onChange={this.handleValueChange}
                                            name='METFORMINA'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="METFORMINA_DOSIS_input"
                                            type="number"
                                            label="Dosis Metformina"
                                            placeholder="Dosis Metformina"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='METFORMINA_DOSIS'
                                            value={this.state.visits[this.state.visit].METFORMINA_DOSIS}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="SFU_input" 
                                            label="SFU"
                                            value={this.state.visits[this.state.visit].SFU} 
                                            onChange={this.handleValueChange}
                                            name='SFU'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="SFU_DOSIS_Input"
                                            type="number"
                                            label="Dosis SFU"
                                            placeholder="Dosis SFU"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='SFU_DOSIS'
                                            value={this.state.visits[this.state.visit].SFU_DOSIS}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="GLICLAZ_input" 
                                            label="GLICLAZ"
                                            value={this.state.visits[this.state.visit].GLICLAZ} 
                                            onChange={this.handleValueChange}
                                            name='GLICLAZ'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="GLICLAZ_DOSIS_Input"
                                            type="number"
                                            label="Dosis GLICLAZ"
                                            placeholder="Dosis GLICLAZ"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='GLICLAZ_DOSIS'
                                            value={this.state.visits[this.state.visit].GLICLAZ_DOSIS}
                                        />
                                    </div>
                                </div>
                                <div className='row'>                                        
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="GLITAZONAS_input" 
                                            label="GLITAZONAS"
                                            value={this.state.visits[this.state.visit].GLITAZONAS} 
                                            onChange={this.handleValueChange}
                                            name='GLITAZONAS'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="GLITAZONAS_DOSIS_Input"
                                            type="number"
                                            label="Dosis GLITAZONAS"
                                            placeholder="Dosis GLITAZONAS"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='GLITAZONAS_DOSIS'
                                            value={this.state.visits[this.state.visit].GLITAZONAS_DOSIS}
                                        />
                                    </div>
                                </div>
                                <div className='row'>                                        
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="IDPP4_input" 
                                            label="IDPP4"
                                            value={this.state.visits[this.state.visit].IDPP4} 
                                            onChange={this.handleValueChange}
                                            name='IDPP4'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="IDPP4_DOSIS_Input"
                                            type="number"
                                            label="Dosis IDPP4"
                                            placeholder="Dosis IDPP4"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='IDPP4_DOSIS'
                                            value={this.state.visits[this.state.visit].IDPP4_DOSIS}
                                        />
                                    </div>
                                </div>
                                <div className='row'>    
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="SGLT2_input" 
                                            label="SGLT2"
                                            value={this.state.visits[this.state.visit].SGLT2} 
                                            onChange={this.handleValueChange}
                                            name='SGLT2'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="SGLT2_DOSIS_Input"
                                            type="number"
                                            label="Dosis SGLT2"
                                            placeholder="Dosis SGLT2"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='SGLT2_DOSIS'
                                            value={this.state.visits[this.state.visit].SGLT2_DOSIS}
                                        />
                                    </div>
                                </div>
                                <div className='row'>        
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="GLP1_input" 
                                            label="GLP1"
                                            value={this.state.visits[this.state.visit].GLP1} 
                                            onChange={this.handleValueChange}
                                            name='GLP1'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="GLP1_DOSIS_Input"
                                            type="number"
                                            label="Dosis GLP1"
                                            placeholder="Dosis GLP1"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='GLP1_DOSIS'
                                            value={this.state.visits[this.state.visit].GLP1_DOSIS}
                                        />
                                    </div>
                                </div>

                                <div className='row'>        
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="ezetimibe_input" 
                                            label="Ezetimibe"
                                            value={this.state.visits[this.state.visit].ezetimibe} 
                                            onChange={this.handleValueChange}
                                            name='ezetimibe'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-sm-offset-6 col-md-offset-0 col-md-4">
                                        <FieldGroup
                                            id="ezetimibe_dosis_Input"
                                            type="number"
                                            label="Dosis Ezetimibe"
                                            placeholder="Dosis Ezetimibe"
                                            help="Dosis en mg del fármaco en cuestión cada 24h"
                                            onChange={this.handleValueChange}
                                            name='ezetimibe_dosis'
                                            value={this.state.visits[this.state.visit].ezetimibe_dosis}
                                        />
                                    </div>
                                </div>
                                <div className='row'>     
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="fibratos_input" 
                                            label="Fibratos"
                                            value={this.state.visits[this.state.visit].fibratos} 
                                            onChange={this.handleValueChange}
                                            name='fibratos'
                                            options={[{value: 1, label: "Si"}, {value: 0, label: "No"}]}
                                            />
                                    </div>   
                                    <div className="col-xs-12 col-sm-6 col-md-4">
                                        <SelectFieldGroup
                                            id="test_morisky_green_input" 
                                            label="Test Morisky Green"
                                            value={this.state.visits[this.state.visit].test_morisky_green} 
                                            onChange={this.handleValueChange}
                                            name='test_morisky_green'
                                            options={[
                                                {value: 0, label: ""}, 
                                                {value: 1, label: "Cumplidor (No a las 4 preguntas)"},
                                                {value: 2, label: "No Cumplidor (Sí a una o  más)"}
                                            ]}
                                            />
                                    </div>
                                </div>
                            </div>
                        )}
                        {this.state.tabkey === "3" && (
                            /* ECG */
                            <div className="tab-content">
                            {(this.state.visits[this.state.visit].ekg_img === undefined || this.state.visits[this.state.visit].ekg_img === "") && (
                                <div className='row'>
                                    <div className="col-xs-12 col-xs-offset-0 col-sm-4 col-sm-offset-8 col-md-3 col-md-offset-9">
                                        <Button bsStyle="primary" block={true} onClick={this.openFile}><Glyphicon glyph="plus-sign"/> Adjuntar EKG</Button>
                                        <input
                                            ref={input => this.fileEkg = input}
                                            type="file"
                                            accept=".jpg"
                                            className="hidden"
                                            onChange={this.uploadEkg}
                                            />
                                    </div>
                                </div>
                            )}
                            {(this.state.visits[this.state.visit].ekg_img !== undefined && this.state.visits[this.state.visit].ekg_img !== "") && (
                                <div className='row'>
                                    <div className="col-xs-12">
                                        <img alt="EKG" src={this.state.visits[this.state.visit].ekg_img} className="ekg"></img>
                                    </div>
                                    <div className="col-xs-12 col-xs-offset-0 col-sm-4 col-sm-offset-8 col-md-3 col-md-offset-9">
                                        <Button bsStyle="danger" block={true} onClick={this.removeEkg}><Glyphicon glyph="remove-sign"/> Eliminar EKG</Button>
                                    </div>
                                </div>
                            )}
                            <div className='row'>
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <DatePicker 
                                        id="fecha_ECG_datepicker"
                                        label="Fecha del ECG"
                                        value={this.state.visits[this.state.visit].fecha_ECG} 
                                        onChange={
                                            (isoString) => {
                                                this.setDateTimeValueCurrentVisit('fecha_ECG', isoString);
                                            }}
                                        />    
                                </div>
                            </div>
                            <div className="row">    
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="sexoInput" 
                                        label="Ritmo"
                                        value={this.state.visits[this.state.visit].ritmo} 
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
                                        value={this.state.visits[this.state.visit].FC}
                                        />
                                </div>
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="PRInput"
                                        type="number"
                                        label="PR (milisegundos)"
                                        placeholder="PR (milisegundos)"
                                        onChange={this.handleValueChange}
                                        name='PR'
                                        value={this.state.visits[this.state.visit].PR}
                                        />
                                </div>
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="QRSInput"
                                        type="number"
                                        label="QRS (milisegundos)"
                                        placeholder="QRS (milisegundos)"
                                        onChange={this.handleValueChange}
                                        name='QRS'
                                        value={this.state.visits[this.state.visit].QRS}
                                        />
                                </div>
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="QTcInput"
                                        type="number"
                                        label="QTc (milisegundos)"
                                        placeholder="QTc"
                                        onChange={this.handleValueChange}
                                        name='QTc'
                                        value={this.state.visits[this.state.visit].QTc}
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
                                        value={this.state.visits[this.state.visit].EJE_P} 
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
                                        value={this.state.visits[this.state.visit].EJE_QRS} 
                                        />
                                </div>
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="EjeTInput"
                                        type="number"
                                        label="Eje T"
                                        placeholder="Eje T"
                                        onChange={this.handleValueChange}
                                        name='EJE_T'
                                        value={this.state.visits[this.state.visit].EJE_T} 
                                        />                                  
                                </div>
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="P_alturaInput"
                                        type="number"
                                        label="Altura de P en II (mm)"
                                        placeholder="P Altura (mm)"
                                        onChange={this.handleValueChange}
                                        name='P_altura'
                                        value={this.state.visits[this.state.visit].P_altura}
                                        />
                                </div>
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="P_anchuraInput"
                                        type="number"
                                        label="Anchura de P en II (mm)"
                                        placeholder="P Anchura (mm)"
                                        onChange={this.handleValueChange}
                                        name='P_anchura'
                                        value={this.state.visits[this.state.visit].P_anchura}
                                        />
                                </div>
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="P_melladaInput" 
                                        label="P Mellada en II"
                                        value={this.state.visits[this.state.visit].P_mellada} 
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
                                        value={this.state.visits[this.state.visit].P_en_V1_1mm} 
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
                                        value={this.state.visits[this.state.visit].Q_patologica} 
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
                                        value={this.state.visits[this.state.visit].Q_I_y_aVL_no_patolog} 
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
                                        value={this.state.visits[this.state.visit].Q_inferior_no_patolog} 
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
                                        value={this.state.visits[this.state.visit].Q_V3_4_no_patolog} 
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
                                        value={this.state.visits[this.state.visit].Q_V5_6_no_patolog} 
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
                                        value={this.state.visits[this.state.visit].muesca_inf_QRS} 
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
                                        value={this.state.visits[this.state.visit].muesca_lat_QRS} 
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
                                        value={this.state.visits[this.state.visit].muesca_ant_QRS} 
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
                                        label="R en I (mm)"
                                        placeholder="R en I (mm)"
                                        onChange={this.handleValueChange}
                                        name='R_en_I'
                                        value={this.state.visits[this.state.visit].R_en_I}
                                    />
                                </div>   
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="R_en_III_Input"
                                        type="number"
                                        label="R en III (mm)"
                                        placeholder="R en III (mm)"
                                        onChange={this.handleValueChange}
                                        name='R_en_III'
                                        value={this.state.visits[this.state.visit].R_en_III}
                                    />
                                </div>  
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="R_en_aVF_Input"
                                        type="number"
                                        label="R en AVF (mm)"
                                        placeholder="R en AVF (mm)"
                                        onChange={this.handleValueChange}
                                        name='R_en_aVF'
                                        value={this.state.visits[this.state.visit].R_en_aVF}
                                    />
                                </div>   
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="R_en_aVL_Input"
                                        type="number"
                                        label="R en AVL (mm)"
                                        placeholder="R en AVL (mm)"
                                        onChange={this.handleValueChange}
                                        name='R_en_aVL'
                                        value={this.state.visits[this.state.visit].R_en_aVL}
                                    />
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="R_en_V2_Input"
                                        type="number"
                                        label="R en V2 (mm)"
                                        placeholder="R en V2 (mm)"
                                        onChange={this.handleValueChange}
                                        name='R_en_V2'
                                        value={this.state.visits[this.state.visit].R_en_V2}
                                    />
                                </div>      
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="R_en_V5_Input"
                                        type="number"
                                        label="R en V5 (mm)"
                                        placeholder="R en V5 (mm)"
                                        onChange={this.handleValueChange}
                                        name='R_en_V5'
                                        value={this.state.visits[this.state.visit].R_en_V5}
                                    />
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="R_en_V6_Input"
                                        type="number"
                                        label="R en V6 (mm)"
                                        placeholder="R en V6 (mm)"
                                        onChange={this.handleValueChange}
                                        name='R_en_V6'
                                        value={this.state.visits[this.state.visit].R_en_V6}
                                    />
                                </div>   
                            </div>
                            <div className="row">
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="S_en_I_Input"
                                        type="number"
                                        label="S en I (mm)"
                                        placeholder="S en I (mm)"
                                        onChange={this.handleValueChange}
                                        name='S_en_I'
                                        value={this.state.visits[this.state.visit].S_en_I}
                                    />
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="S_en_II_Input"
                                        type="number"
                                        label="S en II (mm)"
                                        placeholder="S en II (mm)"
                                        onChange={this.handleValueChange}
                                        name='S_en_II'
                                        value={this.state.visits[this.state.visit].S_en_II}
                                    />
                                </div>  
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="S_en_III_Input"
                                        type="number"
                                        label="S en III (mm)"
                                        placeholder="S en III (mm)"
                                        onChange={this.handleValueChange}
                                        name='S_en_III'
                                        value={this.state.visits[this.state.visit].S_en_III}
                                    />
                                </div>  
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="S_en_V1_Input"
                                        type="number"
                                        label="S en V1 (mm)"
                                        placeholder="S en V1 (mm)"
                                        onChange={this.handleValueChange}
                                        name='S_en_V1'
                                        value={this.state.visits[this.state.visit].S_en_V1}
                                    />
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="S_en_V3_Input"
                                        type="number"
                                        label="S en V3 (mm)"
                                        placeholder="S en V3 (mm)"
                                        onChange={this.handleValueChange}
                                        name='S_en_V3'
                                        value={this.state.visits[this.state.visit].S_en_V3}
                                    />
                                </div>  
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <FieldGroup
                                        id="S_en_V6_Input"
                                        type="number"
                                        label="S en V6 (mm)"
                                        placeholder="S en V6 (mm)"
                                        onChange={this.handleValueChange}
                                        name='S_en_V6'
                                        value={this.state.visits[this.state.visit].S_en_V6}
                                    />
                                </div>  
                            </div>
                            <div className="row">
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="bloqueos_ramaInput" 
                                        label="Bloqueos Rama"
                                        value={this.state.visits[this.state.visit].bloqueos_rama} 
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
                                        value={this.state.visits[this.state.visit].hemibloqueos} 
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
                                        label="Indice de Sokolow-Lyon"
                                        placeholder="Indice de Sokolow-Lyon"
                                        onChange={this.handleValueChange}
                                        name='Sokolow'
                                        help="Suma de la onda S en V1 y onda R en V5 o V6 >/= 3,5 mV (35 mm)"
                                        value={this.state.visits[this.state.visit].Sokolow}
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
                                        help='Hombres: S en V3 + R en aVL >2,8 mV (28 mm) - Mujeres: S en V3 + R en aVL >2,0 mV (20 mm)'
                                        value={this.state.visits[this.state.visit].Cornell}
                                    />
                                </div> 
                            </div>
                            <div className="row">
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="STInput" 
                                        label="ST"
                                        value={this.state.visits[this.state.visit].ST} 
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
                                        value={this.state.visits[this.state.visit].ST_alterado} 
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
                                        id="extrasistoles_Input" 
                                        label="Extrasístoles"
                                        value={this.state.visits[this.state.visit].extrasistoles} 
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

                            <div className="row">    
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_I_Input" 
                                        label="T en I"
                                        value={this.state.visits[this.state.visit].t_en_I} 
                                        onChange={this.handleValueChange}
                                        name='t_en_I'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_II_Input" 
                                        label="T en II"
                                        value={this.state.visits[this.state.visit].t_en_II} 
                                        onChange={this.handleValueChange}
                                        name='t_en_II'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_III_Input" 
                                        label="T en III"
                                        value={this.state.visits[this.state.visit].t_en_III} 
                                        onChange={this.handleValueChange}
                                        name='t_en_III'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_AVL_Input" 
                                        label="T en AVL"
                                        value={this.state.visits[this.state.visit].t_en_AVL} 
                                        onChange={this.handleValueChange}
                                        name='t_en_AVL'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_AVF_Input" 
                                        label="T en AVF"
                                        value={this.state.visits[this.state.visit].t_en_AVF} 
                                        onChange={this.handleValueChange}
                                        name='t_en_AVF'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_AVR_Input" 
                                        label="T en AVR"
                                        value={this.state.visits[this.state.visit].t_en_AVR} 
                                        onChange={this.handleValueChange}
                                        name='t_en_AVR'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_V1_Input" 
                                        label="T V1 (Cara Septal)"
                                        value={this.state.visits[this.state.visit].t_en_V1} 
                                        onChange={this.handleValueChange}
                                        name='t_en_V1'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_V2_Input" 
                                        label="T V2 (Cara Septal)"
                                        value={this.state.visits[this.state.visit].t_en_V2} 
                                        onChange={this.handleValueChange}
                                        name='t_en_V2'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_V3_Input" 
                                        label="T V3 (Cara Anterior)"
                                        value={this.state.visits[this.state.visit].t_en_V3} 
                                        onChange={this.handleValueChange}
                                        name='t_en_V3'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_V4_Input" 
                                        label="T V4 (Cara Anterior)"
                                        value={this.state.visits[this.state.visit].t_en_V4} 
                                        onChange={this.handleValueChange}
                                        name='t_en_V4'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_V5_Input" 
                                        label="T V5 (Cara Lateral)"
                                        value={this.state.visits[this.state.visit].t_en_V5} 
                                        onChange={this.handleValueChange}
                                        name='t_en_V5'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                    <SelectFieldGroup
                                        id="t_en_V6_Input" 
                                        label="T V6 (Cara Lateral)"
                                        value={this.state.visits[this.state.visit].t_en_V6} 
                                        onChange={this.handleValueChange}
                                        name='t_en_V6'
                                        options={[
                                            {value: 0, label: ""},
                                            {value: 1, label: "Positiva"},
                                            {value: 2, label: "Plana"},
                                            {value: 3, label: "Negativa asimétrica"},
                                            {value: 4, label: "Negativa simétrica"},
                                        ]}
                                        />   
                                </div> 
                                <div className="col-xs-12">
                                    <FieldGroup
                                        id="observaciones_textarea"
                                        componentClass="textarea"
                                        rows="8"
                                        label="Observaciones"
                                        placeholder="Observaciones"
                                        onChange={this.handleValueChange}
                                        name='observaciones'
                                        value={this.state.visits[this.state.visit].observaciones}
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
                                            value={this.state.visits[this.state.visit].fumador} 
                                            onChange={this.handleValueChange}
                                            name='fumador'
                                            options={[
                                                {value: 0, label: "No ( > 1 año )"},
                                                {value: 1, label: "Sí"},
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
                                            value={this.state.visits[this.state.visit].cigarrillos}
                                        />
                                    </div> 
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <SelectFieldGroup
                                            id="alcoholInput" 
                                            label="Alcohol"
                                            value={this.state.visits[this.state.visit].alcohol} 
                                            onChange={this.handleValueChange}
                                            name='alcohol'
                                            options={[
                                                {value: 0, label: "Abstinente"},
                                                {value: 1, label: "Moderado (M: 0-25 gr/día, H: 0-40 gr/día)"},
                                                {value: 2, label: "Excesivo (M: > 25 gr/día, H: > 40 gr/día)"},
                                            ]}
                                            />
                                    </div> 
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <SelectFieldGroup
                                            id="sal_Input" 
                                            label="Sal"
                                            value={this.state.visits[this.state.visit].sal} 
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
                                            value={this.state.visits[this.state.visit].dieta_mediterranea} 
                                            onChange={this.handleValueChange}
                                            name='dieta_mediterranea'
                                            options={[
                                                {value: 0, label: "No"},
                                                {value: 1, label: "Sí"},
                                            ]}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <SelectFieldGroup
                                            id="ejercicio_fisico_Input" 
                                            label="Ejercicio físico"
                                            value={this.state.visits[this.state.visit].ejercicio_fisico} 
                                            onChange={this.handleValueChange}
                                            name='ejercicio_fisico'
                                            options={[
                                                {value: 0, label: "No (Nada)"},
                                                {value: 1, label: "Moderado (1 hora, 3 días a la semana)"},
                                                {value: 2, label: "Diario"},
                                            ]}
                                            />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <SelectFieldGroup
                                            id="HTA_Input" 
                                            label="HTA"
                                            value={this.state.visits[this.state.visit].HTA} 
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
                                            value={this.state.visits[this.state.visit].años_HTA}
                                            help="Años desde que se diagnosticó la HTA"
                                        />  
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <SelectFieldGroup
                                            id="HTA_secundaria_input" 
                                            label="HTA Secundaria"
                                            value={this.state.visits[this.state.visit].HTA_secundaria} 
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
                                            value={this.state.visits[this.state.visit].causa_HTA_secund} 
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
                                            label="Diagnóstico HTA"
                                            help="¿Cómo se realizó el diagnóstico?"
                                            value={this.state.visits[this.state.visit].Dgtco_HTA} 
                                            onChange={this.handleValueChange}
                                            name='Dgtco_HTA'
                                            options={dictionaryOptionsLists.Dgtco_HTA}
                                        />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <SelectFieldGroup
                                            id="AF_MS_input" 
                                            label="AF MS"
                                            value={this.state.visits[this.state.visit].AF_MS} 
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
                                            value={this.state.visits[this.state.visit].AF_C_Isq_precoz} 
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
                                            value={this.state.visits[this.state.visit].HTA_controlada} 
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
                                            value={this.state.visits[this.state.visit].DM} 
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
                                            value={this.state.visits[this.state.visit].fecha_dgtco_DM} 
                                            onChange={
                                                (isoString) => {
                                                    this.setDateTimeValueCurrentVisit('fecha_dgtco_DM', isoString);
                                                }}
                                            />    
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                                        <SelectFieldGroup
                                            id="DLP_input" 
                                            label="DLP"
                                            value={this.state.visits[this.state.visit].DLP} 
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
                                            value={this.state.visits[this.state.visit].IC} 
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
                                            value={this.state.visits[this.state.visit].fecha_dgtco_IC} 
                                            onChange={
                                                (isoString) => {
                                                    this.setDateTimeValueCurrentVisit('fecha_dgtco_IC', isoString);
                                                }}
                                            />    
                                    </div>
                                </div>
                                <div className="row"> 
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <SelectFieldGroup
                                            id="IC_input" 
                                            label="TEP"
                                            value={this.state.visits[this.state.visit].tep} 
                                            onChange={this.handleValueChange}
                                            name='IC'
                                            options={[
                                                {value: 0, label: "No"},
                                                {value: 1, label: "Sí"},
                                            ]}
                                        />
                                    </div>
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <DatePicker 
                                            label="Fecha de suceso TEP"
                                            value={this.state.visits[this.state.visit].fecha_suceso_tep} 
                                            onChange={
                                                (isoString) => {
                                                    this.setDateTimeValueCurrentVisit('fecha_suceso_tep', isoString);
                                                }}
                                            />    
                                    </div>
                                </div>
                                <div className="row"> 
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <SelectFieldGroup
                                            id="FA_input" 
                                            label="FA"
                                            value={this.state.visits[this.state.visit].FA} 
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
                                            value={this.state.visits[this.state.visit].fecha_dgtco_FA} 
                                            onChange={
                                                (isoString) => {
                                                    this.setDateTimeValueCurrentVisit('fecha_dgtco_FA', isoString);
                                                }}
                                            />    
                                    </div>
                                </div>
                                <div className="row"> 
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <SelectFieldGroup
                                            id="ictus_input" 
                                            label="Ictus"
                                            value={this.state.visits[this.state.visit].ictus} 
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
                                            value={this.state.visits[this.state.visit].fecha_dgtco_ictus} 
                                            onChange={
                                                (isoString) => {
                                                    this.setDateTimeValueCurrentVisit('fecha_dgtco_ictus', isoString);
                                                }}
                                            />    
                                    </div>
                                </div>
                                <div className="row"> 
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <SelectFieldGroup
                                            id="carotidas_input" 
                                            label="Carótidas"
                                            value={this.state.visits[this.state.visit].carotidas} 
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
                                            value={this.state.visits[this.state.visit].fecha_dgtco_carotidas} 
                                            onChange={
                                                (isoString) => {
                                                    this.setDateTimeValueCurrentVisit('fecha_dgtco_carotidas', isoString);
                                                }}
                                            />    
                                    </div>
                                </div>
                                <div className="row"> 
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <SelectFieldGroup
                                            id="claudicacion_intermitente_input" 
                                            label="Claudicación intermitente (CInt)"
                                            value={this.state.visits[this.state.visit].claudicacion_intermitente} 
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
                                            value={this.state.visits[this.state.visit].fecha_dgtco_claudicacion} 
                                            onChange={
                                                (isoString) => {
                                                    this.setDateTimeValueCurrentVisit('fecha_dgtco_claudicacion', isoString);
                                                    
                                                }}
                                            />    
                                    </div>
                                </div>
                                <div className="row"> 
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <SelectFieldGroup
                                            id="cardiop_isquemica_input" 
                                            label="Cardiopatía Isquemica (CI)"
                                            value={this.state.visits[this.state.visit].cardiop_isquemica} 
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
                                            value={this.state.visits[this.state.visit].fecha_cardiop_isquemica} 
                                            onChange={
                                                (isoString) => {
                                                    this.setDateTimeValueCurrentVisit('fecha_cardiop_isquemica', isoString);
                                                }}
                                            />    
                                    </div>
                                </div>
                                <div className="row"> 
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <SelectFieldGroup
                                            id="disfuncionSexualInput" 
                                            label="Disfunción Sexual"
                                            value={this.state.visits[this.state.visit].disfuncionSexual} 
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
                                            value={this.state.visits[this.state.visit].SAOS} 
                                            onChange={this.handleValueChange}
                                            name='SAOS'
                                            options={[
                                                {value: 0, label: "No"},
                                                {value: 1, label: "SAOS, sin TTO con CPAP"},
                                                {value: 2, label: "SAOS, con TTO con CPAP nocturna"},
                                            ]}
                                            />
                                    </div>
                                </div>
                                <div className="row"> 
                                    <div className="col-xs-12 col-sm-6 col-lg-3">
                                        <SelectFieldGroup
                                            id="epocInput" 
                                            label="EPOC"
                                            value={this.state.visits[this.state.visit].EPOC} 
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
                                            value={this.state.visits[this.state.visit].gradodEPOC} 
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
                            /* ANALITICA */
                            <div className="tab-content">
                            <div className='row'>
                                <div className="col-xs-12 col-sm-6 col-lg-3">
                                    <SelectFieldGroup
                                        id="analitica_basal_input" 
                                        label="Analítica basal"
                                        value={this.state.visits[this.state.visit].analitica_basal} 
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
                                        value={this.state.visits[this.state.visit].fecha_analitica} 
                                        onChange={
                                            (isoString) => {
                                                this.setDateTimeValueCurrentVisit('fecha_analitica', isoString);
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
                                        name='hb'
                                        value={this.state.visits[this.state.visit].hb}
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
                                        value={this.state.visits[this.state.visit].hcto}
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
                                        value={this.state.visits[this.state.visit].VCM}
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
                                        value={this.state.visits[this.state.visit].CHCM}
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
                                        value={this.state.visits[this.state.visit].plaquetas}
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
                                        value={this.state.visits[this.state.visit].glucosa}
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
                                        value={this.state.visits[this.state.visit].hb1Ac}
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
                                        value={this.state.visits[this.state.visit].urea}
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
                                        value={this.state.visits[this.state.visit].creatinina}
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
                                        disabled="disabled"
                                        value={this.state.visits[this.state.visit].FG}
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
                                        value={this.state.visits[this.state.visit].Na}
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
                                        value={this.state.visits[this.state.visit].K}
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
                                        value={this.state.visits[this.state.visit].GOT}
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
                                        value={this.state.visits[this.state.visit].GPT}
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
                                        value={this.state.visits[this.state.visit].GGT}
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
                                        value={this.state.visits[this.state.visit].CT}
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
                                        value={this.state.visits[this.state.visit].LDL}
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
                                        value={this.state.visits[this.state.visit].HDL}
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
                                        value={this.state.visits[this.state.visit].TG}
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
                                        value={this.state.visits[this.state.visit].microalbuminuria}
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
                                        value={this.state.visits[this.state.visit].cociente_alb_cr}
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
                                        value={this.state.visits[this.state.visit].proteinuria}
                                    />
                                </div>
                            </div>
                        
                        </div>
                        )}
                        {this.state.tabkey === "6" && (
                            /* PRUEBAS */
                            <div className="tab-content">
                            <div className='row'>
                                <div className="col-xs-12 col-sm-6 col-lg-3">
                                    <SelectFieldGroup
                                        id="MAPA_reciente_input" 
                                        label="Mapa Reciente?"
                                        value={this.state.visits[this.state.visit].mapa_reciente} 
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
                                        value={this.state.visits[this.state.visit].mapa_diurna}
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
                                        value={this.state.visits[this.state.visit].mapa_nocturno}
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
                                        value={this.state.visits[this.state.visit].dip}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-12 col-sm-6 col-lg-3">
                                    <SelectFieldGroup
                                        id="ecocardio_input" 
                                        label="Ecocardio"
                                        value={this.state.visits[this.state.visit].ecocardio} 
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
                                        value={this.state.visits[this.state.visit].fecha_ecocardio} 
                                        onChange={
                                            (isoString) => {
                                                this.setDateTimeValueCurrentVisit('fecha_ecocardio', isoString);
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
                                        value={this.state.visits[this.state.visit].DTDVI}
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
                                        value={this.state.visits[this.state.visit].septo}
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
                                        value={this.state.visits[this.state.visit].masa}
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
                                        value={this.state.visits[this.state.visit].AI}
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
                                        value={this.state.visits[this.state.visit].FEVI}
                                    />
                                </div>
                                <div className="col-xs-12 col-sm-6 col-lg-3">
                                    <SelectFieldGroup
                                        id="diastole_input" 
                                        label="Diástole"
                                        value={this.state.visits[this.state.visit].diastole} 
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
                                        value={this.state.visits[this.state.visit].valvulopatia} 
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
                                        value={this.state.visits[this.state.visit].fondo_ojo} 
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
                                        value={this.state.visits[this.state.visit].fecha_fondo_ojo} 
                                        onChange={
                                            (isoString) => {
                                                this.setDateTimeValueCurrentVisit('fecha_fondo_ojo', isoString);
                                            }}
                                        />    
                                </div>
                                <div className="col-xs-12 col-sm-6 col-lg-3">
                                    <SelectFieldGroup
                                        id="fondo_ojo_patol_input" 
                                        label="Fondo ojo patológico"
                                        value={this.state.visits[this.state.visit].fondo_ojo_patologico} 
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
                                        value={this.state.visits[this.state.visit].renal_estudio} 
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
                                        value={this.state.visits[this.state.visit].patologia_renal} 
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
                                        value={this.state.visits[this.state.visit].cual_patologia_renal}
                                    />
                                </div>
                                <div className="col-xs-12 col-sm-6 col-lg-3">
                                    <SelectFieldGroup
                                        id="proteinuria_input" 
                                        label="Proteinuria"
                                        value={this.state.visits[this.state.visit].proteinuria_pruebas} 
                                        onChange={this.handleValueChange}
                                        name='proteinuria_pruebas'
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
                        {this.state.tabkey === "7" && (
                            /* PLAN ESPECÍFICO CON EL PACIENTE */
                            <div className="tab-content">
                                <div className='row'>
                                    <div className="col-xs-12">
                                        <FieldGroup
                                            id="plan_paciente_textarea"
                                            componentClass="textarea"
                                            rows="15"
                                            label="Plan específico con el paciente"
                                            placeholder="Plan específico con el paciente"
                                            onChange={this.handleValueChange}
                                            name='plan_paciente'
                                            value={this.state.visits[this.state.visit].plan_paciente}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                )}
                <div className="row btns top">
                    {this.state.visits.length <= 0 && this.state.exists && (
                        <div className="col-xs-12 col-sm-4 col-sm-offset-8 col-md-4 col-md-offset-8 col-lg-3 col-lg-offset-9">
                            <Button bsStyle="primary" block={true} onClick={this.newSession}>Crear visita</Button>
                        </div>
                    )}
                    {this.state.visits.length > 0  && this.state.exists && (
                        <div className="col-xs-12 col-sm-4 col-sm-offset-8 col-md-4 col-md-offset-8 col-lg-3 col-lg-offset-9">
                            <Button bsStyle="success" block={true} onClick={this.save}>Guardar</Button>
                        </div>
                    )}
                </div>
            </div>
        );
        return result;
    }
   
}

