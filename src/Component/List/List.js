import React from 'react';
import { Table, Glyphicon, Label, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { map, size } from 'lodash';
import CustomModal from '../Form/Modal/CustomModal';
import './List.css';

export default class List extends React.Component {

    constructor(props) {
        super(props);
        this.load = this.load.bind(this);
        this.delete = this.delete.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.state = {
            pagina: 1,
            elementos: 10,
            collection: [],
            loaded: false,
            message: {txt: "", type: "info", showClose: false, closeCallback: undefined}
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
        this.props.fb.firestore().collection("results")
                .orderBy("id", "desc").get()
                .then(querySnapshot => {
            var collection = [];
            querySnapshot.forEach(doc => {
                collection.push(doc.data());
            });
            this.setState({collection: collection, loaded: true, message: {txt: "", type: "info", showClose: false, closeCallback: undefined}});
        });
    }

    delete(id){
        var that = this;
        this.props.fb.firestore().collection("results").doc(id).delete().then(function() {
            that.showMessage("Se ha borrado el usuario", "success", true, () => that.refresh());
        }).catch(function(error) {
            that.showMessage("Se produjo un error, inténtalo de nuevo.", "danger", true, () => that.refresh());
        });
    }

    showMessage(txt, type, showClose, closeCallback){
        this.setState({message: {txt: txt, type: type, showClose: showClose, closeCallback: closeCallback}});
    }

    handleCloseModal() {
        var callback = this.state.message.closeCallback ? this.state.message.closeCallback() : () => {};
        this.setState(
            {message: {txt: "", type: "info", showClose: false}}, 
            callback()
        );
    }

    render() {
        return (
            <div ref="mainRef">
                <CustomModal handleCloseModal={this.handleCloseModal} message={this.state.message} />
                {this.state.loaded && (size(this.state.collection)>0 ? (
                <Table responsive>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Identificación</th>
                            <th>Nombre</th>
                            <th>Apellidos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {map(this.state.collection, (result) => (
                        <tr key={result.id}>
                            <td>{result.id}</td>
                            <td>{result.identificacion}</td>
                            <td>{result.nombre}</td>
                            <td>{(result.apellido1 + " " + result.apellido2).trim()}</td>
                            <td className="list-btns">
                                <Link to={'/private/detail/' + result.id} className="btn btn-primary">
                                    <Glyphicon glyph="pencil" />
                                </Link>
                                <Button bsStyle="danger" onClick={() => this.delete(result.id)}>
                                    <Glyphicon glyph="trash" />
                                </Button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </Table>):(
                    <div className="row"><div className="col-12 text-center"><Label bsStyle="warning"><Glyphicon glyph="exclamation-sign" /> Aún no hay ningún paciente registrado</Label></div></div>
                ))
            }

            </div>
        );
    }
   
}