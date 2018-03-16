import React from 'react';
import {FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { map, reverse } from 'lodash';
import HelpIcon from '../HelpIcon';

import './DatePicker.css';

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default createReactClass({
  displayName: 'DatePicker',

  propTypes: {
    value: PropTypes.string,
    minYear: PropTypes.number,
    maxYear: PropTypes.number,
    monthLabels: PropTypes.array,
    onChange: PropTypes.func,
    nullable: PropTypes.bool,
    id: PropTypes.string,
    label: PropTypes.string,
    help: PropTypes.string
  },

  getDefaultProps() {
    return {
      monthLabels: [
        'Enero', 'Febrero', 'Marzo', 'Abril',
        'Mayo', 'Junio', 'Julio', 'Agosto', 
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      minYear: 1900,
      maxYear: (new Date()).getFullYear(),
      nullable: true,
      id: "datepicker_" + Math.random + "_" + (new Date()).getDate(),
      label: "",
      help: ""
    };
  },

  getInitialState() {
    return this.makeDateValues(this.props.value);
  },

  makeDateValues(isoString) {
    const selectedDate = isoString ? 
      new Date(`${isoString.slice(0,10)}T12:00:00.000Z`) : 
      (this.props.nullable?null:new Date(`${new Date().toISOString().slice(0,10)}T12:00:00.000Z`)); 

    if(selectedDate !== null) {
      return {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
        day: selectedDate.getDate()
      };
    } else {
      return {
        year: 0,
        month: -1,
        day: 0
      };
    }
  },

  getValue() {
    if(this.state.year === 0) {
      return "";
    }
    return (new Date(this.state.year, this.state.month, this.state.day, 12, 0, 0, 0)).toISOString();
  },

  handleInputChange() {
    if (this.props.onChange) {
      this.props.onChange(this.getValue());
    }
  },

  onChangeYear(event) {
    console.log(event.target.value);
    var that = this;
    this.setState({
      year: parseInt(event.target.value, 10)
    }, () => {
      var newState = {};
      if(that.state.year > 0) {
        if(that.state.month === -1) {
          newState.month = 0;
        }
        if(that.state.day === 0) {
          newState.day = 1;
        }
      } else {
        newState.month = -1;
        newState.day = 0;
      }
      that.setState(newState, () => {
        if(that.state.day > that.getMonthDays(that.state.year, that.state.month)) {
          that.setState({
            day: that.getMonthDays(that.state.year, that.state.month)
          });
        }
        that.handleInputChange();
      });
    });
  },

  onChangeMonth(event) {
    var that = this;
    this.setState({
      month: parseInt(event.target.value, 10)
    }, () => {
      var newState = {};
      if(that.state.month > -1) {
        if(that.state.year === 0) {
          newState.year = (new Date()).getFullYear();
        }
        if(that.state.day === 0) {
          newState.day = 1;
        }
      } else {
        newState.year = 0;
        newState.day = 0;
      }
      that.setState(newState, () => {
        if(that.state.day > that.getMonthDays(that.state.year, that.state.month)) {
          that.setState({
            day:  that.getMonthDays(that.state.year,that.state.month)
          });
        }
        that.handleInputChange();
      });
    })
  },

  onChangeDay(event) {
    var that = this;
    this.setState({
      day: parseInt(event.target.value, 10)
    }, () => {
      var newState = {};
      if(that.state.day > 0) {
        if(that.state.year === 0) {
          newState.year = (new Date()).getFullYear();
        }
        if(that.state.month === -1) {
          newState.month = 1;
        }
      } else {
        newState.year = 0;
        newState.month = -1;
      }
      that.setState(newState, () => {
        that.handleInputChange();
      });
    });
  },

  componentWillReceiveProps(newProps) {
    const value = newProps.value;
    if (this.getValue() !== value) {
      this.setState(this.makeDateValues(value));
    }
  },

  getMonthDays(year, month) {
    if(year === 0 || month === -1) {
      return 0;
    }
    let monthLength = daysInMonth[month];
    if (month === 1) {
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        monthLength = 29;
      }
    }
    return monthLength;
  },

  range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
  },

  render() {
    return (
      <FormGroup controlId={this.props.id}>
        {this.props.label !== "" && <ControlLabel>{this.props.label} <HelpIcon text={this.props.help} /></ControlLabel>}
        <div>
          <FormControl componentClass="select" className="day" onChange={this.onChangeDay} value={this.state.day}>
            {this.props.nullable && <option value={0}></option>}
            {map(this.range(1, this.getMonthDays(this.state.year, this.state.month)), (day) => (<option key={"day" + day} value={day}>{day}</option>))}
          </FormControl>
          <FormControl componentClass="select" className="month" onChange={this.onChangeMonth} value={this.state.month}>
            {this.props.nullable && <option value={-1}></option>}
            {map(this.props.monthLabels, (label, idx) => (<option key={"month" + idx} value={idx}>{label}</option>))}
          </FormControl>
          <FormControl componentClass="select" className="year" onChange={this.onChangeYear} value={this.state.year}>
            {this.props.nullable && <option value={0}></option>}
            {map(reverse(this.range(this.props.minYear, this.props.maxYear)), (year) => (<option key={"year" + year} value={year}>{year}</option>))}
          </FormControl>
        </div>
      </FormGroup> 
    );
  }
});