import React from 'react';
import { Table } from 'react-bootstrap';
import {Link} from 'react-router-dom';

export default class List extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            pagina: 1,
            elementos: 10,
        };
    }
      
    render() {
        return (
            <div>
                <Link to={'/private/detail/khBIV2EUPuhm97l9uWTI'} className="btn btn-primary">Ir</Link>
                <Table responsive>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>Table heading</th>
                        <th>Table heading</th>
                        <th>Table heading</th>
                        <th>Table heading</th>
                        <th>Table heading</th>
                        <th>Table heading</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>1</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        </tr>
                        <tr>
                        <td>2</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        </tr>
                        <tr>
                        <td>3</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        <td>Table cell</td>
                        </tr>
                    </tbody>
                    </Table>
            </div>
        );
    }
   
}