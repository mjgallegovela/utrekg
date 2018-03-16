import React from 'react';
import ReactDOM from 'react-dom';
import {Glyphicon} from 'react-bootstrap';
import CustomTooltip from './CustomTooltip';

const HelpIcon = ({text, ...props }) => {
    var target = null;
    const renderProps = {
        text: text,
        placement: "top"
      };
    const tooltipDivId = "tooltip_div_" + Math.random;
    const style = {
        "float": "right", "marginLeft": "3px"
    }
    return (
        <div style={ style }>
        {text && <Glyphicon 
            ref={gliph => { target = gliph }} 
            onMouseOut={() => {
              renderProps.show = false;
              renderProps.target = ReactDOM.findDOMNode(target);
              ReactDOM.render(
                <CustomTooltip {...renderProps} />,
                document.getElementById(tooltipDivId)
              );
            }} 
            onMouseOver={() => {
              renderProps.show = true;
              renderProps.target = ReactDOM.findDOMNode(target);
              ReactDOM.render(
                <CustomTooltip {...renderProps} />,
                document.getElementById(tooltipDivId)
              );
            }}
            glyph="question-sign" />}
        <span id={tooltipDivId}></span></div>
    );
}
export default HelpIcon;