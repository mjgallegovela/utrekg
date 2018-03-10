import React from 'react';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import { map } from 'lodash';
var key = 0;
const SelectFieldGroup = ({ id, label, help, options, ...props }) => (
    <FormGroup controlId="formControlsSelect">
        <ControlLabel>{label}</ControlLabel>
        <FormControl componentClass="select" placeholder="select" {...props}>
            {map(options, (option) => (<option key={key++} value={option.value}>{option.label}</option>))}
        </FormControl>
    </FormGroup>
);

export default SelectFieldGroup;