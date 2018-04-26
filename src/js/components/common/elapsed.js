import React, { Component } from 'react';
// display elapsed time by converting galactic time to client time
const secToString = function(secs) {
    if (secs <= 0) {
      return 'Completed';
    }
    secs = Math.floor(secs)
    var min = 60;
    var hour = 60 * min;
    var day = 24 * hour;
    var week = 7 * day;
    var year = 52 * week;
    var fy = function(s) {
      if (s < year) {
        return ['', s];
      } else {
        return [Math.floor(s / year) + 'y', s % year];
      }
    }
    var fw = function(tup) {
      var str = tup[0];
      var sec = tup[1];
      if (sec < week) {
        return [str, sec];
      } else {
        return [str + ' ' + Math.floor(sec / week) + 'w', sec % week];
      }
    }
    var fd = function(tup) {
      var str = tup[0];
      var sec = tup[1];
      if (sec < day) {
        return [str, sec];
      } else {
        return [str + ' ' + Math.floor(sec / day) + 'd', sec % day];
      }
    }
    var fh = function(tup) {
      var str = tup[0];
      var sec = tup[1];
      if (sec < hour) {
        return [str, sec];
      } else {
        return [str + ' ' + Math.floor(sec / hour) + 'h', sec % hour];
      }
    }
    var fm = function(tup) {
      var str = tup[0];
      var sec = tup[1];
      if (sec < min) {
        return [str, sec];
      } else {
        return [str + ' ' + Math.floor(sec / min) + 'm', sec % min];
      }
    }
    var fs = function(tup) {
      var str = tup[0];
      var sec = tup[1];
      return str + ' ' + sec + 's';
    }
    return fs(fm(fh(fd(fw(fy(secs)))))).trim();
  }

export class Elapsed extends Component {
  constructor(props) {
    super(props);
    // console.log('elapsed props...', props);
  }

  renderTime() {
    const serverTime = new Date(this.props.timestring);
    const clientTime = new Date(); // local
    return secToString((clientTime - serverTime) / 1000).split(' ')[0];
  }

  render() {
    return (
      <div>-{this.renderTime()}</div>
    )
  }
}
