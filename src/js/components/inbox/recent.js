/*
  Data structure:
    common: {
      host: zod,
      hostProfileUrl: (...)/~zod/profile,

      cir: [@ta/dmjoin]

      station: [host]/[circle]
      stationUrl: [streamUrl/collIndexUrl]

      subcircle: @ta
      subcircleUrl: (...)collIndexUrl/subcircle

      type: {"dm", "chat", "fora"}
    }

    Breadcrumb display:
      [host] [circle* /coll@ta [*]/dmjoin *] [...subcollection]

      case "dm":
        <span mono *>[dmjoin]</span>

    dm:

*/


import React, { Component } from 'react';
import { Elapsed } from '/components/lib/elapsed';
import { Message } from '/components/lib/message';
import { prettyShip, isDMStation, getMessageContent } from '/lib/util';
import { getStationDetails } from '/services';
import { Icon } from '/components/lib/icon';
import _ from 'lodash';

export class InboxRecentPage extends Component {
  buildSectionContent(section) {
    let lastAut = "";

    let messageRows = section.msgs.map((msg, i) => {
      let messageDetails = getMessageContent(msg);
      let isPostUpdate = messageDetails.contentType === "blog";

      let ret = (
        <div key={i}>
          {lastAut !== msg.aut &&
            <div className={`row align-center ${isPostUpdate && 'mt-3'}`}>
              <div className="flex-col-1"></div>
              <div className="flex-col-1 flex justify-end">
                {isPostUpdate &&
                  <Icon type='icon-collection-post' iconLabel={true}/>
                }
              </div>
              <div className="flex-col-x">
                {messageDetails.postUrl &&
                  <a className="pr-12 text-600 underline"
                    href={messageDetails.postUrl}>
                    {messageDetails.postTitle}
                  </a>
                }
                <span className="text-mono"><a className="shipname" href={prettyShip(msg.aut)[1]}>{prettyShip(`~${msg.aut}`)[0]}</a></span>
              </div>
            </div>
          }
          <div className="row">
            <div className="flex-col-2"></div>
            <div className="flex-col-x">
              <Message details={messageDetails} api={this.props.api} storeReports={this.props.storeReports} pushCallback={this.props.pushCallback} transitionTo={this.props.transitionTo}></Message>
            </div>
          </div>
        </div>
      );

      lastAut = msg.aut;
      return ret;
    });

    return messageRows;
  }

  buildSections(sections) {
    return sections.map((section, i) => {
      let sectionContent = this.buildSectionContent(section);

      return (
        <div className="mt-4 mb-6" key={i}>
          {section.stationDetails.type !== "stream-dm" &&
            <div className="row">
              <div className="flex-col-2"></div>
              <div className="flex-col-x text-mono text-small text-300">
                <a href={section.stationDetails.hostProfileUrl} className="vanilla">~{section.stationDetails.host}</a>
                <span className="ml-2 mr-2">/</span>
              </div>
            </div>
          }
          <div className="row align-center">
            <div className="flex-col-1"></div>
            <div className="flex-col-1 flex justify-end">
              <Icon type={section.icon} iconLabel={true}/>
            </div>
            <div className="flex-col-x">
              <a href={section.stationDetails.stationUrl} className="text-600 underline">{section.stationDetails.stationTitle}</a>
            </div>
          </div>
          {sectionContent}
        </div>
      )
    })
  }

  getSectionIconType(msgDetails, stationDetails) {
    if (stationDetails.type === "stream-chat") {
      return "icon-stream-chat";
    } else if (stationDetails.type === "stream-dm" ) {
      return "icon-stream-dm";
    } else if (stationDetails.type === "collection-index" && msgDetails.type === "new item") {
      return "icon-collection-index";
    } else if (stationDetails.type === "collection-post" && msgDetails.type === "new item") {
      return "icon-collection-comment";
    }
  }

  // Group inbox messages by time-chunked stations, strictly ordered by message time.
  // TODO:  Inbox does not handle messages with multiple audiences very well
  getSectionData() {
    let inbox = this.props.store.messages.inbox.messages;

    let lastStationName = [];
    let lastMessageType = "";
    let sections = [];
    let stationIndex = -1;

    for (var i = 0; i < inbox.length; i++) {
      let msg = inbox[i];
      let aud = msg.aud[0];
      let msgDetails = getMessageContent(msg);
      let stationDetails = getStationDetails(aud);

      if (aud !== lastStationName || msgDetails.type !== lastMessageType) {
        sections.push({
          name: aud,
          msgs: [msg],
          icon: this.getSectionIconType(msgDetails, stationDetails),
          msgDetails: msgDetails,
          stationDetails: stationDetails
        });
        stationIndex++;
      } else {
        sections[stationIndex].msgs.push(msg);
      }

      lastStationName = aud;
      lastMessageType = msgDetails.type;
    }

    return sections;
  }

  render() {
    const sections = this.getSectionData();
    const sectionElems = this.buildSections(sections);

    return sectionElems;
  }
}
