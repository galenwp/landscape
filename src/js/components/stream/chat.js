import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import { Message } from '/components/lib/message';
import { prettyShip, isUrl, uuid, getMessageContent, isDMStation, dateToDa } from '/lib/util';
// import { createDMStation } from '/services';
import { sealDict } from '/components/lib/seal-dict';
import { Elapsed } from '/components/lib/elapsed';
import { PAGE_STATUS_PROCESSING, PAGE_STATUS_READY, REPORT_PAGE_STATUS } from '/lib/constants';
import Mousetrap from 'mousetrap';
import classnames from 'classnames';

export class ChatPage extends Component {
  constructor(props) {
    super(props);

    this.presence = false;

    // // TODO: This is bad. Issue is that queryParams aren't being loaded properly
    let station = props.queryParams.station || "~zod/null";

    let circle = station.split("/")[1];
    let host = station.split("/")[0].substr(1);

    this.state = {
      station,
      circle,
      host,
      placeholder: `Send a message to /${circle}`,
      message: "",
      invitee: "",
      numMessages: 0,
      scrollLocked: true,
      pendingMessages: [],
      // dmStationCreated: false,
      activatedMsg: {
        dateGroup: null,  // TODO: What's a good "0" value for Dates?
        date: null
      }
    };

    this.messageChange = this.messageChange.bind(this);
    this.messageSubmit = this.messageSubmit.bind(this);

    this.inviteChange = this.inviteChange.bind(this);
    this.inviteSubmit = this.inviteSubmit.bind(this);

    this.onScrollStop = this.onScrollStop.bind(this);
    this.mouseenterActivate = this.mouseenterActivate.bind(this);
    this.mouseleaveActivate = this.mouseleaveActivate.bind(this);

    this.buildMessage = this.buildMessage.bind(this);

    this.scrollbarRef = React.createRef();
    this.textareaRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    let messages = props.store.messages.stations[state.station] || [];
    let clearIndexes = [];

    messages.forEach(msg => {
      state.pendingMessages.forEach((pend, i) => {
        if (msg.uid === pend.uid) {
          clearIndexes.push(i);
        }
      })
    });

    _.pullAt(state.pendingMessages, clearIndexes);

    return {
      ...state,
      pendingMessages: state.pendingMessages,
    }
  }

  bindShortcuts() {
    Mousetrap(this.textareaRef.current).bind('enter', e => {
      e.preventDefault();
      e.stopPropagation();

      this.messageSubmit(e);
    });
  }

  componentDidMount() {
    if (isDMStation(this.state.station)) {
      let cir = this.state.station.split("/")[1];
      this.props.api.hall({
        newdm: {
          sis: cir.split(".")
        }
      })
    }

    this.props.storeReports([{
      type: REPORT_PAGE_STATUS,
      data: PAGE_STATUS_PROCESSING
    }]);

    this.props.pushCallback("inbox.sources-loaded", rep => {
      let inboxSrc = this.props.store.messages.inbox.src;
      let isSubscribed = inboxSrc.includes(this.state.station);
      let isForeignHost = this.props.api.authTokens.ship !== this.state.host;

      // TODO: Not exactly guaranteed to execute after "newdm" action -- probably
      // conditional this to execute when "circles" returns, if not existing yet
      let path, host;

      if (isForeignHost && isSubscribed) {
        path = `/circle/inbox/${this.state.station}/config-l/grams/-20`;
        host = this.props.api.authTokens.ship;
      } else {
        path = `/circle/${this.state.circle}/config-l/grams/-20`;
        host = this.state.host;
      }

      this.props.api.bind(path, "PUT", host);
    });

    this.scrollIfLocked();
    this.bindShortcuts();
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateNumMessagesLoaded(prevProps, prevState);
  }

  updateNumMessagesLoaded(prevProps, prevState) {
    let station = prevProps.store.messages.stations[this.state.station] || [];
    let numMessages = station.length;

    if (numMessages > prevState.numMessages && this.scrollbarRef.current) {
      this.setState({
        numMessages: numMessages
      });

      this.scrollIfLocked();
    }
  }

  scrollIfLocked() {
    if (this.state.scrollLocked && this.scrollbarRef.current) {
      this.scrollbarRef.current.scrollToBottom();
    }
  }

  requestChatBatch() {
    let newNumMessages = this.state.numMessages + 50;

    this.props.storeReports([{
      type: REPORT_PAGE_STATUS,
      data: PAGE_STATUS_PROCESSING
    }])

    let path = `/circle/${this.state.circle}/grams/-${newNumMessages}/-${this.state.numMessages}`;

    this.props.api.bind(path, "PUT", this.state.host)
      .then((res) => {
        if (res.status === 500) {
          this.props.storeReports([{
            type: REPORT_PAGE_STATUS,
            data: PAGE_STATUS_READY
          }])
        }
      });

    this.props.pushCallback('circle.nes', rep => {
      this.props.storeReports([{
        type: REPORT_PAGE_STATUS,
        data: PAGE_STATUS_READY
      }])
    })
  }

  onScrollStop() {
    let scroll = this.scrollbarRef.current.getValues();

    this.setState({
      scrollLocked: (scroll.top === 1)
    });

    if (scroll.top === 0) {
      this.requestChatBatch();
    }
  }

  messageChange(event) {
    this.setState({message: event.target.value});
  }

  inviteChange(event) {
    this.setState({invitee: event.target.value});
  }

  messageSubmit() {
    let aud, sep;
    let wen = Date.now();
    let uid = uuid();
    let aut = this.props.api.authTokens.ship;

    let config = this.props.store.configs[this.state.station];

    if (isDMStation(this.state.station)) {
      aud = this.state.station
        .split("/")[1]
        .split(".")
        .map((mem) => `~${mem}/${this.state.circle}`);

    } else {
      aud = [this.state.station];
    }

    if (isUrl(this.state.message)) {
      sep = {
        url: this.state.message
      }
    } else {
      sep = {
        lin: {
          msg: this.state.message,
          pat: false
        }
      }
    }

    let message = {
      uid,
      aut,
      wen,
      aud,
      sep,
    };

    this.props.api.hall({
      convey: [message]
    });

    this.setState({
      message: "",
      pendingMessages: this.state.pendingMessages.concat({...message, pending: true})
    });

    // TODO:  Push to end of event queue to let pendingMessages render before scrolling
    //        There's probably a better way to do this
    setTimeout(() => {
      if (this.scrollbarRef.current) this.scrollbarRef.current.scrollToBottom();
    })
  }

  inviteSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    this.props.api.permit(this.state.circle, [this.state.invitee], true);

    this.setState({
      invitee: ""
    });
  }

  assembleChatRows(messages) {
    let chatRows = [];
    let prevDay = 0;
    let prevName = "";
    let dateGroup;

    // group messages by author
    for (var i = 0; i < messages.length; i++) {
      if (prevName !== messages[i].aut) {
        dateGroup = messages[i].wen;

        chatRows.push({
          printship: true,
          aut: messages[i].aut,
          dateGroup
        });

        prevName = messages[i].aut;
      }

      chatRows.push({...messages[i], dateGroup});
    }

    return chatRows;
  }

  setPresence(station) {
    if (!this.presence) {
      this.presence = true;

      this.props.api.hall({
        notify: {
          aud: [station],
          pes: "idle"
        }
      });
    }
  }

  mouseenterActivate(e) {
    if (e.currentTarget.dataset.date) {
      this.activateMessageGroup(e.currentTarget.dataset.dateGroup, e.currentTarget.dataset.date);
    }
  }

  mouseleaveActivate(e) {
    this.activateMessageGroup(null, null);
  }

  activateMessageGroup(dateGroup, date) {
    this.setState({
      activatedMsg: {
        dateGroup: dateGroup,
        date: date
      }
    });
  }

  buildMessage(msg) {
    let contentElem;

    let details = msg.printship ? null : getMessageContent(msg);
    let appClass = classnames({
      'row': true,
      'align-center': true,
      'chat-msg-app': msg.app,
      'chat-msg-pending': msg.pending,
      'mt-4': msg.printship
    });

    if (msg.printship) {
      contentElem = (
        <React.Fragment>
          <a className="vanilla hoverline text-600 text-mono" href={prettyShip(msg.aut)[1]}>{prettyShip(`~${msg.aut}`)[0]}</a>
          {msg.dateGroup === parseInt(this.state.activatedMsg.dateGroup, 10) &&
            <React.Fragment>
              <Elapsed timestring={parseInt(this.state.activatedMsg.date, 10)} classes="ml-5 mr-2 text-timestamp" />
              <span className="text-mono text-gray">{dateToDa(new Date(parseInt(this.state.activatedMsg.date, 10)))}</span>
            </React.Fragment>
          }
        </React.Fragment>
      )
    } else {
      contentElem = <Message details={details}></Message>
    }

    return (
      <div key={msg.uid}
           className={appClass}
           data-date={msg.wen}
           data-date-group={msg.dateGroup}
           onMouseEnter={this.mouseenterActivate}
           onMouseLeave={this.mouseleaveActivate}>
        <div className="flex-col-2 flex align-center justify-end">
          {msg.printship &&
            <a className="vanilla chat-sigil" href={prettyShip(msg.aut)[1]}>
              {sealDict.getSeal(msg.aut, 18, true)}
            </a>
          }
        </div>
        <div className="flex-col-x">
          {contentElem}
        </div>
      </div>
    )
  }

  render() {
    // TODO: This is bad. Issue is that props aren't being loaded properly
    if (this.state.station === "~zod/null") return null;

    let messages = this.props.store.messages.stations[this.state.station] || [];
    messages = [...messages, ...this.state.pendingMessages];

    this.setPresence(this.state.station);

    let chatRows = this.assembleChatRows(messages);
    let chatMessages = chatRows.map(this.buildMessage);

    return (
      <div className="container flex flex-column space-between">
        <Scrollbars
          ref={this.scrollbarRef}
          renderTrackHorizontal={props => <div style={{display: "none"}}/>}
          onScrollStop={this.onScrollStop}
          renderView={props => <div {...props} className="chat-scrollpane-view"/>}
          autoHide
          className="chat-scrollpane flex-chat-body">
          {chatMessages}
        </Scrollbars>
        <div className="row mt-3 flex-chat-input">
          <div className="flex-col-2 flex justify-end">
            <a className="vanilla chat-sigil" href={prettyShip(api.authTokens.ship)[1]}>
              {sealDict.getSeal(api.authTokens.ship, 18, true)}
            </a>
          </div>
          <div className="flex-col-x">
            <form>
              <textarea className="chat-input-field"
                resize="none"
                ref={this.textareaRef}
                placeholder={this.state.placeholder}
                value={this.state.message}
                onChange={this.messageChange} />
            </form>
          </div>
        </div>
      </div>
    )
  }
}
