import React from 'react';
import { Table, Glyphicon, Label, Button, Jumbotron } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { map, size } from 'lodash';
import CustomModal from '../Form/Modal/CustomModal';
import './List.css';
import SelectFieldGroup from '../Form/SelectFieldGroup';
import FieldGroup from '../Form/FieldGroup';
import DatePicker from '../Form/DatePicker/DatePicker';

var moment = require('moment');

const SEARCH_OPTIONS = {
    ORDER_BY_ID: 1,
    ORDER_BY_DATE: 2,
    ORDER_BY_SURNAME: 3,
    ORDER_BY_IDENTIFICATION: 4
}

export default class List extends React.Component {

    constructor(props) {
        super(props);
        this.load = this.load.bind(this);
        this.refresh = this.refresh.bind(this);
        this.delete = this.delete.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.changeSearchMode = this.changeSearchMode.bind(this);
        this.setFilterValue = this.setFilterValue.bind(this);
        this.cleanFilterAndSearch = this.cleanFilterAndSearch.bind(this);
        this.handlePaginationChange = this.handlePaginationChange.bind(this);
        this.state = {
            pagina: 1,
            elementos: 10,
            collection: [],
            loaded: false,
            message: {txt: "", type: "info", showClose: false, closeCallback: undefined},
            searchMode: SEARCH_OPTIONS.ORDER_BY_SURNAME,
            filter: "",
            currentPage: 0,
            itemsPage: 10,

        };
    }
    
    componentDidMount(){
        this.refresh();
    }

    refresh(){
        this.setState(
            {message: {txt: "Cargando...", type: "info", showClose: false}}, 
            this.setState({loaded: false}, () => this.load())
        );
    }

    load(){
        let ref = null;
        console.log(this.state.searchMode);
        if (this.state.searchMode === SEARCH_OPTIONS.ORDER_BY_DATE) {
            ref = this.props.fb.firestore().collection("customers")
            if(this.state.filter.from !== ""){
                ref = ref.where("fecha_registro", ">=", this.state.filter.from);
            }
            if(this.state.filter.to !== ""){
                ref = ref.where("fecha_registro", "<=", this.state.filter.to);
            }
            ref = ref.orderBy("fecha_registro", "asc");
        } else if(this.state.searchMode === SEARCH_OPTIONS.ORDER_BY_SURNAME) {
            ref = this.props.fb.firestore().collection("customers").orderBy("apellidosearch", "asc");
            if(this.state.filter !== ""){
                ref = ref.startAt(this.state.filter).endAt(this.state.filter+'\uf8ff')
            }
        } else if(this.state.searchMode === SEARCH_OPTIONS.ORDER_BY_ID) {
            ref = this.props.fb.firestore().collection("customers").orderBy("id", "desc");
            if(this.state.filter !== ""){
                console.log(this.state.filter);
                ref = ref.startAt(this.state.filter+'\uf8ff').endAt(this.state.filter)
            }
        } else {
            ref = this.props.fb.firestore().collection("customers").orderBy("identificacion", "asc");
            if(this.state.filter !== ""){
                ref = ref.startAt(this.state.filter).endAt(this.state.filter+'\uf8ff')
            }
        }

        ref.get().then(querySnapshot => {
            var collection = [];
            var nitems = 0;
            querySnapshot.forEach(doc => {
                collection.push(doc.data());
                if(++nitems >= this.state.itemsPage) {
                    nitems = 0;
                }
            });
            this.setState({collection: collection, loaded: true, message: {txt: "", type: "info", showClose: false, closeCallback: undefined}});
        });
    }

    confirmDelete(id) {
        var that = this;
        this.setState({
            message: {
                txt: "¿Estás seguro de querer borrar este usuario?", 
                type: "default", 
                acceptCancel: true, 
                handleAccept: () => {
                    that.delete(id);
                },
                handleCancel: () => {
                    that.setState({message: {txt: "", type: "info", showClose: false, closeCallback: undefined}});
                }
            }
        });
    }

    delete(id){
        
        var that = this;
        this.showMessage("Borrando paciente...", "info", false);
        this.props.fb.firestore().collection("customers").doc(id).delete().then(function() {
            that.showMessage("Se ha borrado el usuario", "success", true, () => that.refresh());
        }).catch(function(error) {
            that.showMessage("Se produjo un error, inténtalo de nuevo.", "danger", true, () => that.refresh());
        });
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

    changeSearchMode(event) {
        var newSearchMode = parseInt(event.target.value, 10);
        var filter = "";
        if(newSearchMode === SEARCH_OPTIONS.ORDER_BY_DATE) {
            filter = {from: "", to: ""}
        }
        this.setState({searchMode: newSearchMode, filter: filter});
    }

    setFilterValue(event) {
        this.setState({filter: event.target.value});
    }

    cleanFilterAndSearch() {
        var filter = "";
        if(this.state.searchMode === SEARCH_OPTIONS.ORDER_BY_DATE) {
            filter = {from: "", to: ""}
        }
        var that = this;
        this.setState({filter: filter}, () => that.refresh());;
    }

    handlePaginationChange(event) {
        var newState = this.state;
        newState[event.target.name] = event.target.value;
        this.setState(newState);
    }

    render() {

        var listToShow = this.state.collection;
        var pageLabel = "Todos los elementos";
        var from = 0;
        if(this.state.itemsPage > 0) {
            var currentPage = parseInt(this.state.currentPage, 10);
            var itemsPage = parseInt(this.state.itemsPage, 10)
            from = itemsPage * currentPage;
            var to = (currentPage+1) * itemsPage;

            if(to > this.state.collection.length) {
                to = this.state.collection.length;
            }
            
            listToShow = listToShow.slice(from, to);
            pageLabel = "Elementos " + (1 + from) + " a " + (to) + " de un total de " + this.state.collection.length;

            var pages = [];
            for(var i=0;this.state.collection.length > (i * itemsPage);i++) {
                pages.push({value: i, label: "Página " + (i+1)});
            }
        }

        return (
            <div ref="mainRef">
                <CustomModal handleCloseModal={this.handleCloseModal} message={this.state.message} />
                <Jumbotron>
                    <div className='row'>
                        <div className="col-xs-12 col-sm-12 col-md-8 col-lg-6">
                            <SelectFieldGroup
                                id="searchMode" 
                                label="Ordenar y filtrar por:"
                                value={this.state.searchMode} 
                                onChange={this.changeSearchMode}
                                name='searchMode'
                                options={[
                                    {value: SEARCH_OPTIONS.ORDER_BY_SURNAME, label: "Primer Apellido"},
                                    {value: SEARCH_OPTIONS.ORDER_BY_ID, label: "ID"},
                                    {value: SEARCH_OPTIONS.ORDER_BY_IDENTIFICATION, label: "Identificación"},
                                    {value: SEARCH_OPTIONS.ORDER_BY_DATE, label: "Fecha de registro"},
                                ]}
                            />
                        </div>
                    </div>
                    
                    {this.state.searchMode === SEARCH_OPTIONS.ORDER_BY_ID && (
                        <div className="row">
                            <div className="col-xs-12 col-md-6">
                                <FieldGroup
                                    id="idInput"
                                    type="text"
                                    label="ID"
                                    placeholder="ID"
                                    onChange={this.setFilterValue}
                                    name='filter'
                                    value={this.state.filter}
                                    className={"mayus"}
                                    />
                            </div>
                        </div>  
                    )}
                    {this.state.searchMode === SEARCH_OPTIONS.ORDER_BY_IDENTIFICATION && (
                        <div className="row">
                            <div className="col-xs-12 col-md-6">
                                <FieldGroup
                                    id="identificacionInput"
                                    type="text"
                                    label="Identificación"
                                    placeholder="Identificación"
                                    onChange={this.setFilterValue}
                                    name='filter'
                                    value={this.state.filter}
                                    className={"mayus"}
                                    />
                            </div>
                        </div>  
                    )}
                    {this.state.searchMode === SEARCH_OPTIONS.ORDER_BY_SURNAME && (
                        <div className="row">
                            <div className="col-xs-12 col-md-6">
                                <FieldGroup
                                    id="surnameInput"
                                    type="text"
                                    label="Primer Apellido"
                                    placeholder="Primer Apellido (minúscula)"
                                    onChange={this.setFilterValue}
                                    name='filter'
                                    value={this.state.filter}
                                    className={"minus"}
                                    />
                            </div>
                        </div>  
                    )}
                    {this.state.searchMode === SEARCH_OPTIONS.ORDER_BY_DATE && (
                        <div className="row">
                            <div className="col-xs-12 col-md-6">
                                <DatePicker 
                                    label="Desde"
                                    value={this.state.filter.from} 
                                    onChange={
                                        (isoString) => {
                                            var filter = this.state.filter;
                                            filter.from = isoString;
                                            this.setState({filter: filter});
                                        }}
                                    />    
                            </div>
                            <div className="col-xs-12 col-md-6">
                                <DatePicker 
                                    label="Hasta"
                                    value={this.state.filter.to} 
                                    onChange={
                                        (isoString) => {
                                            var filter = this.state.filter;
                                            filter.to = isoString;
                                            this.setState({filter: filter});
                                        }}
                                    />   
                            </div>
                        </div>
                    )}
                       
                    <div className='row searchButtonBar'>
                        <div className="col-xs-12 text-right">
                            <Button bsStyle="primary" onClick={this.cleanFilterAndSearch}>Limpiar y buscar</Button>
                            <Button bsStyle="success" onClick={this.refresh}>Filtrar</Button>
                        </div>
                    </div>
                    {this.state.loaded && size(this.state.collection)>0 && (
                        <div className={"pagination-container"}>
                            <div className='row searchButtonBar'>
                                <div className="col-xs-12 col-md-6">                
                                    <SelectFieldGroup
                                        id="elementsPage" 
                                        label="Elementos por página"
                                        value={this.state.itemsPage} 
                                        onChange={this.handlePaginationChange}
                                        name='itemsPage'
                                        options={[
                                            {value: 0, label: "Todos"},
                                            {value: 5, label: "5 elementos por página"},
                                            {value: 10, label: "10 elementos por página"},
                                            {value: 20, label: "20 elementos por página"},
                                            {value: 50, label: "50 elementos por página"},
                                            {value: 100, label: "100 elementos por página"},
                                        ]}
                                    />
                                </div>
                                {this.state.itemsPage > 0 && (
                                    <div className="col-xs-12 col-md-6">                
                                        <SelectFieldGroup
                                            id="elementsPage" 
                                            label="Página"
                                            value={this.state.currentPage} 
                                            onChange={this.handlePaginationChange}
                                            name='currentPage'
                                            options={pages}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="row">
                                <div className="col-xs-12 text-center">
                                    {pageLabel}
                                </div>
                            </div>
                        </div>
                    )}
                    
                </Jumbotron>
                {this.state.loaded && (size(this.state.collection)>0 ? (
                    <div>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Id</th>
                                    <th>Identificación</th>
                                    <th>Nombre</th>
                                    <th>Apellidos</th>
                                    <th>Registro</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                            
                                {map(listToShow, (result) => (
                                <tr className={"customer"} key={result.id}>
                                    <td className={"row-index"}>#{++from}</td>
                                    <td>{result.id}</td>
                                    <td>{result.identificacion}</td>
                                    <td>{result.nombre}</td>
                                    <td>{(result.apellido1 + " " + result.apellido2).trim()}</td>
                                    <td>{moment(new Date(result.fecha_registro)).format("DD-MM-YYYY")}</td>
                                    <td className="list-btns">
                                        <Link to={'/private/detail/' + result.id} className="btn btn-primary">
                                            <Glyphicon glyph="pencil" />
                                        </Link>
                                        <Button bsStyle="danger" onClick={() => this.confirmDelete(result.id)}>
                                            <Glyphicon glyph="trash" />
                                        </Button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ):(
                    <div className="row"><div className="col-12 text-center"><Label bsStyle="warning"><Glyphicon glyph="exclamation-sign" /> Aún no hay ningún paciente registrado</Label></div></div>
                ))
            }

            </div>
        );
    }
   
}