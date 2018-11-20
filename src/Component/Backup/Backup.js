import React from 'react';
import { Table, Glyphicon, Label, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { map, size } from 'lodash';
import CustomModal from '../Form/Modal/CustomModal';
import './Backup.css';

var moment = require('moment');

export default class Backup extends React.Component {

    constructor(props) {
        super(props);
        this.load = this.load.bind(this);
        this.delete = this.delete.bind(this);
        this.createBackup = this.createBackup.bind(this);
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
        this.props.fb.firestore().collection("backups")
                .orderBy("date", "desc")
                .get()
                .then(querySnapshot => {
                    console.log(querySnapshot);
            var collection = [];
            querySnapshot.forEach(doc => {
                console.log(doc.data());
                collection.push(doc.data());
            });
            console.log(collection)
            this.setState({collection: collection, loaded: true, message: {txt: "", type: "info", showClose: false, closeCallback: undefined}});
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

    createBackup() {
        
        this.showMessage("Creando backup...", "info", false);
        var that = this;
        let json_object = {};
        this.props.fb.firestore().collection("customers")
            .orderBy("id", "desc").get()
            .then(customersQuerySnapshot => {
                var customersCollection = [];
                customersQuerySnapshot.forEach(doc => {
                    customersCollection.push(doc.data());
                });

                json_object['customers'] = customersCollection;
                
                var sessionsCollection = [];
                this.props.fb.firestore().collection("sessions")
                    .orderBy("id", "desc").get()
                    .then(sessionsQuerySnapshot => {
                        sessionsQuerySnapshot.forEach(doc => {
                            sessionsCollection.push(doc.data());
                        });
                        json_object['sessions'] = sessionsCollection;

                        console.log(json_object);

                        let storage = this.props.fb.storage();
                        // Create a storage reference from our storage service
                        let storageRef = storage.ref();
                        
                        let backupMoment = new moment();

                        // Child references can also take paths delimited by '/'
                        let backupRef = storageRef.child('backups/' + backupMoment.format("YYYYMMDD") + '_customers.json');
                        backupRef.putString(JSON.stringify(json_object)).then(snapshot => {
                            backupRef.getDownloadURL().then( url =>  {
                                let backupObject = {
                                    date: new Date(),
                                    url: url,
                                    creator: this.props.fb.auth().currentUser.email
                                };
                                this.props.fb.firestore().collection("backups")
                                    .doc(backupMoment.format("YYYYMMDD") + '_customers')
                                    .set(backupObject)
                                    .then(() => {
                                        that.showMessage("Copia creada con éxito", "success", true, () => that.load());
                                    }).catch(ex =>{
                                        console.log(ex);
                                        that.showMessage("No se pudo crear la copia", "danger", true);
                                    });
                            })
                            
                        });
                    });
                
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

    render() {
        return (
            <div ref="mainRef">
                <CustomModal handleCloseModal={this.handleCloseModal} message={this.state.message} />
                <div className="row btns">
                    <div className="col-xs-12 col-xs-offset-0 col-sm-6 col-sm-offset-6 col-md-4 col-md-offset-8 col-lg-3 col-lg-offset-9">
                        <Button bsStyle="success" block={true} onClick={this.createBackup}><Glyphicon glyph="floppy-disk"/> Crear copia de seguridad</Button>
                    </div>
                </div>
                {this.state.loaded && (size(this.state.collection)>0 ? (
                    <div>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Usuario</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {map(this.state.collection, (result) => (
                                <tr key={result.id}>
                                    <td>{(new moment(new Date(result.date))).format("DD-MM-YYYY HH:mm")}</td>
                                    <td>{result.creator}</td>
                                    <td className="list-btns text-right">
                                        <Link to={result.url} target={"_blank"} className="btn btn-success">
                                            <Glyphicon glyph="download" />
                                        </Link>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ):(
                    <div className="row"><div className="col-12 text-center"><Label bsStyle="warning"><Glyphicon glyph="exclamation-sign" /> Aún no se ha creado ninguna copia de seguridad</Label></div></div>
                ))}
            </div>
        );
    }
   
}