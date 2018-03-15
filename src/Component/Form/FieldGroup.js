import React from 'react';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import HelpIcon from './HelpIcon';

const FieldGroup = ({ id, label, help, ...props }) => {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label} <HelpIcon text={help} /></ControlLabel>
      <FormControl {...props} />
    </FormGroup>
    
  );
}

export default FieldGroup;
