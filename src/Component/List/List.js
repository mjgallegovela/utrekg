import React from 'react';
import { Table, Glyphicon, Label } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { map, size } from 'lodash';

export default class List extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            pagina: 1,
            elementos: 10,
            collection: [],
            loaded: false
        };
    }

    componentDidMount(){
        var that = this;
        this.props.fb.firestore().collection("results")
                .orderBy("id", "desc").get()
                .then(querySnapshot => {
            var collection = [];
            querySnapshot.forEach(doc => {
                collection.push(doc.data());
            });
            that.setState({collection: collection, loaded: true});
        });
      }
      
    componentDidUpdate(){
        console.log("componentDidUpdate");
    }


    render() {
        return (
            <div ref="mainRef">
                {this.state.loaded ? (size(this.state.collection)>0 ? (
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
                            <td>
                                <Link to={'/private/detail/' + result.id} className="btn btn-primary">
                                    <Glyphicon glyph="pencil" />
                                </Link>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </Table>):(
                    <div className="row"><div className="col-12 text-center"><Label bsStyle="warning"><Glyphicon glyph="exclamation-sign" /> Aún no hay ningún paciente registrado</Label></div></div>
                )): (
                    <div className="row"><div className="col-12 text-center"><Label bsStyle="info"><Glyphicon glyph="refresh" /> Cargando...</Label></div></div>
                )
            }

            </div>
        );
    }
   
}