import React from 'react';
import {Overlay, Tooltip} from 'react-bootstrap';

const CustomTooltip = ({text, ...props }) => 
  (
    <Overlay {...props}>
      <Tooltip id="overload-left">{text}</Tooltip>
    </Overlay>
  );

export default CustomTooltip;