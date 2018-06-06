import React, { Component } from 'react';
import { IconBlog } from './icons/icon-blog';
import { getQueryParams, normalizeForeignURL } from './util';
import { api } from './urbit-api';
import { Button } from './common/button';

export class Header extends Component {
  constructor(props) {
    super(props);

    this.toggleSubscribe = this.toggleSubscribe.bind(this);
  }

  stationName() {
    return `${this.props.data.ship}/collection_~${this.props.data.id}`;
  }

  isSubscribed() {
    let inbox = this.props.store.configs[`~${api.authTokens.ship}/inbox`];
    if (!inbox) return false;
    return inbox.src.includes(this.stationName());
  }

  toggleSubscribe() {
    let subscribed = this.isSubscribed();

    api.hall({
      source: {
        nom: "inbox",
        sub: !subscribed,
        srs: [this.stationName()]
      }
    });
  }

  getContent() {
    let btnClass = (this.isSubscribed()) ? " btn-secondary" : " btn-primary";
    let btnLabel = (this.isSubscribed()) ? "Unsubscribe" : "Subscribe";

    switch(this.props.type) {
      case "collection-index":
        let collectionURL = normalizeForeignURL(`collections/${this.props.data.id}`);

        let title;
        if (this.props.data.title) {
          title = this.props.data.title;
        } else {
          let collId = this.props.data.id;
          let ship = this.props.data.ship;
          let config = this.props.store.configs[`${ship}/collection_~${collId}`];
          title = (config) ? config.cap : null;
        }

        let actionLink = (this.props.data.postid) ?
          (<a href={`/~~/pages/nutalk/collection/post?coll=${this.props.data.id}`} className="header-link mr-6">Edit</a>) :
          (<a href={`/~~/pages/nutalk/collection/post?coll=${this.props.data.id}`} className="header-link mr-6">Write</a>)

        return (
          <div className="flex space-between">
            <div className="flex align-center">
              <a href="/~~/pages/nutalk/menu" className="mr-22">
                <div className="panini"></div>
              </a>
              <div className="mr-8"><IconBlog /></div>
              <h3><a href={collectionURL}>{title}</a></h3>
            </div>
            <div className="flex align-center">
              {actionLink}
              <Button
                classes={`btn btn-sm${btnClass}`}
                action={this.toggleSubscribe}
                content={btnLabel}
                pushCallback={this.props.pushCallback}
                responseKey="circle.config.dif.source"
                 />
            </div>
          </div>
        )
        break;
      default:
      return (
        <div className="flex">
          <div className="flex align-center">
            <a href="/~~/pages/nutalk/menu" className="mr-22">
              <div className="panini"></div>
            </a>
            <div className="mr-8"><div style={{width: "18px", height: "18px"}}></div></div>
            <h3>Inbox</h3>
            <span className="ml-16"><i>Try using "cmd+k" to open the menu.</i></span>
          </div>
        </div>
      )
      break;
    }
  }

  render() {
    return (
      <div className="header-container">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              {this.getContent()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
