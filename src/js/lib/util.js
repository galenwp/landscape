import _ from 'lodash';
import urbitOb from 'urbit-ob';

export function capitalize(str) {
  return `${str[0].toUpperCase()}${str.substr(1)}`;
}

export function getQueryParams() {
  if (window.location.search !== "") {
    return JSON.parse('{"' + decodeURI(window.location.search.substr(1).replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
  } else {
    return {};
  }
}

export function secToString(secs) {
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

export function collectionAuthorization(stationDetails, usership) {
  if (stationDetails.host === usership) {
    return "write";
  } else if (_.has(stationDetails, "config.con.sec")) {
    let sec = _.get(stationDetails, "config.con.sec", null);
    if (sec === "journal") {
      return "write";
    }
  }

  return "read";
}

export function uuid() {
  let str = "0v"
  str += Math.ceil(Math.random()*8)+"."
  for (var i = 0; i < 5; i++) {
    let _str = Math.ceil(Math.random()*10000000).toString(32);
    _str = ("00000"+_str).substr(-5,5);
    str += _str+".";
  }

  return str.slice(0,-1);
}

export function parseCollCircle(st) {
  let collMeta = /(.*)\/collection_~(~[a-z,\.,0-9]*)(:?_~)?(:?~.*)?/.exec(st);
  let r;
  // console.log('regex', collMeta);
  if (collMeta) {
    r = {
      ship: collMeta[1],
      coll: collMeta[2],
      top: collMeta[4]
    }
  }
  return r;
}

export function isPatTa(str) {
  const r = /^[a-z,0-9,\-,\.,_,~]+$/.exec(str)
  return !!r;
}

export function isValidStation(st) {
  let tokens = st.split("/")

  if (tokens.length !== 2) return false;

  return urbitOb.isShip(tokens[0]) && isPatTa(tokens[1]);
}

export function daToDate(st) {
  var dub = function(n) {
    return parseInt(n) < 10 ? "0" + parseInt(n) : n.toString();
  };
  var da = st.split('..');
  var bigEnd = da[0].split('.');
  var lilEnd = da[1].split('.');
  var ds = `${bigEnd[0].slice(1)}-${dub(bigEnd[1])}-${dub(bigEnd[2])}T${dub(lilEnd[0])}:${dub(lilEnd[1])}:${dub(lilEnd[2])}Z`;
  return new Date(ds);
}

  // ascending for clarity
export function sortSrc(circleArray, topic=false){
  let sc = circleArray.map((c) => util.parseCollCircle(c)).filter((pc) => typeof pc != 'undefined' && typeof pc.top == 'undefined');
  return sc.map((src) => src.coll).sort((a, b) => util.daToDate(a) - util.daToDate(b));
}

export function arrayEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function deSig(ship) {
  return ship.replace('~', '');
}

// use urbit.org proxy if it's not on our ship
export function foreignUrl(shipName, own, urlFrag) {
  if (deSig(shipName) != deSig(own)) {
    return `http://${deSig(shipName)}.urbit.org${urlFrag}`
  } else {
    return urlFrag
  }
}

// shorten comet names
export function prettyShip(ship) {
  const sp = ship.split('-');
  return [sp.length == 9 ? `${sp[0]}_${sp[8]}`: ship, ship[0] === '~' ? `/~~/${ship}/==/web/pages/nutalk/profile` : `/~~/~${ship}/==/web/pages/nutalk/profile`];
}

export function profileUrl(ship) {
  return `/~~/~${ship}/==/web/pages/nutalk/profile`;
}

export function isDMStation(station) {
  let host = station.split('/')[0].substr(1);
  let circle = station.split('/')[1];

  return (
    station.indexOf('.') !== -1 &&
    circle.indexOf(host) !== -1
  );
}

export function calculateStations(configs) {
  let numSubs = Object.keys(configs).filter((sta) => !isDMStation(sta) && !sta.includes("inbox")).length;
  let numDMs = Object.keys(configs).filter((sta) => isDMStation(sta)).length;

  let numString = [];
  if (numSubs) numString.push(`${numSubs} subscriptions`);
  if (numDMs) numString.push(`${numDMs} DMs`);

  numString = numString.join(", ");

  return numString;
}

export function getStationDetails(station, config = {}, usership) {
  let host = station.split("/")[0].substr(1);

  let ret = {
    type: "none",
    station: station,
    config: config,
    host: host,
    cir: station.split("/")[1],
    hostProfileUrl: profileUrl(host)
  };

  let collParts = parseCollCircle(station);

  if (station.includes("inbox")){
    ret.type = "inbox";
  } else if (isDMStation(station)) {
    ret.type = "dm";
  } else if ((station.includes("collection") && collParts.top)) {
    ret.type = "text-topic";
  } else if ((station.includes("collection") && !collParts.top)) {
    ret.type = "text";
  } else {
    ret.type = "chat";
  }

  switch (ret.type) {
    case "inbox":
      ret.stationUrl = "/~~/pages/nutalk";
      ret.stationTitle = ret.cir;
      break;
    case "chat":
      ret.stationUrl = `/~~/pages/nutalk/stream?station=${station}`;
      ret.stationDetailsUrl = `/~~/pages/nutalk/stream/details?station=${station}`;
      ret.stationTitle = ret.cir;
      break;
    case "dm":
      if (config.con) {
        ret.stationTitle = ret.cir
          .split(".")
          .filter((mem) => mem !== usership)
          .map((mem) => `~${mem}`)
          .join(", ");;
      } else {
        ret.stationTitle = "unknown";
      }

      ret.stationUrl = `/~~/pages/nutalk/stream?station=${station}`;
      break;
    case "text":
      ret.collId = collParts.coll;
      ret.stationUrl = `/~~/~${ret.host}/==/web/collections/${collParts.coll}`;
      ret.stationTitle = config.cap;
      break;
    case "text-topic":
      ret.collId = collParts.coll;
      ret.stationUrl = `/~~/~${ret.host}/==/web/collections/${collParts.coll}`;
      ret.stationTitle = config.cap;
      ret.postUrl = `/~~/~${ret.host}/==/web/collections/${collParts.coll}/${collParts.top}`;
      ret.postId = collParts.top;
      ret.postTitle = null;  // TODO: Should be able to determine this from the station metadata alone.
      break;
  }

  return ret;
}

export function getMessageContent(msg) {
  let ret;

  const MESSAGE_TYPES = {
    'sep.app.sep.fat.sep.lin.msg': 'app',
    'sep.app.sep.lin.msg': 'app',
    'sep.fat.sep.lin.msg': (msg) => {
      let station = msg.aud[0];
      let stationDetails = getStationDetails(station);

      let metadata = msg.sep.fat.sep.lin.msg.split("|");
      let content = msg.sep.fat.tac.text.substr(0, 500);
      let postId = metadata[0];
      let postTitle = metadata[1] || content.substr(0, 20);
      let postUrl = `${stationDetails.stationUrl}/${metadata[0]}`;

      return {
        type: 'newpost',
        content,
        postId,
        postTitle,
        postUrl
      }
    },
    'sep.fat.tac.text': 'comment',
    'sep.inv.cir': 'inv',
    'sep.lin.msg': 'lin',
    'sep.url': 'url',
    'sep.exp': (msg) => {
      return {
        type: "exp",
        content: msg.sep.exp.exp,
        res: msg.sep.exp.res.join('\n')
      }
    },
  }

  Object.arrayify(MESSAGE_TYPES).some(({key, value}) => {
    if (_.has(msg, key)) {
      if (typeof value === "string") {
        ret = {
          type: value,
          content: _.get(msg, key)
        }
      } else if (typeof value === "function") {
        ret = value(msg);
      }
      return true;
    }
  });

  return ret;
}

export function getSubscribedStations(ship, storeConfigs) {
  let inbox = storeConfigs[`~${ship}/inbox`];
  if (!inbox) return null;

  let stationDetailList = inbox.src
    .map((station) => {
      if (!storeConfigs[station]) return null;
      return getStationDetails(station, storeConfigs[station], ship)
    })
    .filter((station) => station !== null);

  let ret = {
    chatStations: stationDetailList.filter((d) => d.type === "chat"),
    textStations: stationDetailList.filter((d) => d.type === "text"),
    dmStations: stationDetailList.filter((d) => d.type === "dm"),
  };

  let numSubs = ret.chatStations.length + ret.textStations.length;
  let numDMs = ret.dmStations.length;

  let numString = [];
  if (numSubs > 0) numString.push(`${numSubs} subscriptions`);
  if (numDMs > 0) numString.push(`${numDMs} DMs`);

  ret.numString = numString.join(", ");

  return ret;
}

// maybe do fancier stuff later
export function isUrl(string) {
  const r = /^http|^www|\.com$/.exec(string)
  if (r) {
    return true
  }
  else {
    return false
  }
}
