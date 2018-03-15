import React from 'react';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import { map } from 'lodash';
import HelpIcon from './HelpIcon';

var key = 0;
const SelectFieldGroup = ({ id, label, help, options, ...props }) => (
    <FormGroup controlId="formControlsSelect">
        <ControlLabel>{label} <HelpIcon text={help} /></ControlLabel>
        <FormControl componentClass="select" placeholder="select" {...props}>
            {map(options, (option) => (<option key={key++} value={option.value}>{option.label}</option>))}
        </FormControl>
    </FormGroup>
);

export default SelectFieldGroup;