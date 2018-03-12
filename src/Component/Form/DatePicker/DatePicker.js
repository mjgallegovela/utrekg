// See http://jszen.blogspot.com/2007/03/how-to-build-simple-calendar-with.html for calendar logic.

import React from 'react';
import {FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { map, reverse } from 'lodash';
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
  },

  getDefaultProps() {
    return {
      monthLabels: [
        'Enero', 'Febrero', 'Marzo', 'Abril',
        'Mayo', 'Junio', 'Julio', 'Agosto', 
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      minYear: 1900,
      maxYear: (new Date()).getFullYear()  
    };
  },

  getInitialState() {
    return this.makeDateValues(this.props.value);
  },

  makeDateValues(isoString) {
    console.log("makeDateValues:" + isoString)
    const selectedDate = isoString ? 
      new Date(`${isoString.slice(0,10)}T12:00:00.000Z`) : 
      new Date(`${new Date().toISOString().slice(0,10)}T12:00:00.000Z`); 

    return {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
      day: selectedDate.getDate()
    };
  },

  getValue() {
    return this.state.selectedDate ? this.state.selectedDate.toISOString() : null;
  },

  handleInputChange() {
    if (this.props.onChange) {
      let date = new Date(this.state.year, this.state.month, this.state.day, 12, 0, 0, 0);
      this.props.onChange(date.toISOString());
    }
  },

  onChangeYear(event) {
    var that = this;
    this.setState({
      year: event.target.value
    }, () => {
      if(that.state.day > that.getMonthDays(that.state.year, that.state.month)) {
        that.setState({
          day:  that.getMonthDays(that.state.year, that.state.month)
        });
      }
      that.handleInputChange();
    });
  },

  onChangeMonth(event) {
    var that = this;
    this.setState({
      month: event.target.value
    }, () => {
      if(that.state.day > that.getMonthDays(that.state.year, that.state.month)) {
        that.setState({
          day:  that.getMonthDays(that.state.year,that.state.month)
        });
      }
      that.handleInputChange();
    })
  },

  onChangeDay(event) {
    var that = this;
    this.setState({
      day: event.target.value
    }, () => {
      that.handleInputChange();
    });
  },

  componentWillReceiveProps(newProps) {
    console.log("componentWillReceiveProps");
    const value = newProps.value;
    if (this.getValue() !== value) {
      this.setState(this.makeDateValues(value));
    }
  },

  getMonthDays(year, month) {
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

      <div className="date-picker">
        <FormControl componentClass="select" className="day" onChange={this.onChangeDay} value={this.state.day}>
          {map(this.range(1, this.getMonthDays(this.state.year, this.state.month)), (day) => (<option value={day}>{day}</option>))}
        </FormControl>
        <FormControl componentClass="select" className="month" onChange={this.onChangeMonth} value={this.state.month}>
          {map(this.props.monthLabels, (label, idx) => (<option value={idx}>{label}</option>))}
        </FormControl>
        <FormControl componentClass="select" className="year" onChange={this.onChangeYear} value={this.state.year}>
          {map(reverse(this.range(this.props.minYear, this.props.maxYear)), (year) => (<option value={year}>{year}</option>))}
        </FormControl>
      </div>
    );
  }
});