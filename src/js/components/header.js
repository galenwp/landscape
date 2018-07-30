import React, { Component } from 'react';
import { IconBlog } from '/components/lib/icons/icon-blog';
import { IconStream } from '/components/lib/icons/icon-stream';
import { getQueryParams, getStationDetails, collectionAuthorization, profileUrl, getLoadingClass } from '/lib/util';
import { Button } from '/components/lib/button';
import { PAGE_STATUS_TRANSITIONING, PAGE_STATUS_READY, PAGE_STATUS_PROCESSING } from '/lib/constants';
import classnames from 'classnames';
import _ from 'lodash';

export class Header extends Component {
  constructor(props) {
    super(props);

    this.toggleSubscribe = this.toggleSubscribe.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  isSubscribed(station) {
    let inbox = this.props.store.configs[`~${this.props.api.authTokens.ship}/inbox`];
    if (!inbox) return false;
    return inbox.src.includes(station);
  }

  toggleSubscribe(station) {
    let subscribed = this.isSubscribed(station);

    this.props.api.hall({
      source: {
        nom: "inbox",
        sub: !subscribed,
        srs: [this.props.data.station]
      }
    });
  }

  toggleMenu() {
    this.props.storeReports([{
      type: "menu.toggle",
      data: {open: true}
    }]);
  }

  getStationHeaderData(station) {
    let stationDetails = getStationDetails(station, this.props.store.configs[station], this.props.api.authTokens.ship);

    return {
      title: {
        display: stationDetails.stationTitle,
        href: stationDetails.stationUrl,
        style: "mono"
      },
      breadcrumbs: [{
        display: `~${stationDetails.host}`,
        href: stationDetails.hostProfileUrl
      }],
      station,
      stationDetails
    }
  }

  getHeaderData(type) {
    let headerData = {};
    let defaultData;

    switch (type) {
      case "stream":
        defaultData = this.getStationHeaderData(this.props.data.station);
        headerData = {
          ...defaultData,
          icon: IconStream,
          actions: {
            details: defaultData.stationDetails.stationDetailsUrl,
          },
        }
        break;

      case "collection-index":
        defaultData = this.getStationHeaderData(this.props.data.station);
        headerData = {
          ...defaultData,
          icon: IconBlog,
          title: {
            ...defaultData.title,
            display: (this.props.data.title) ? this.props.data.title : defaultData.title.display
          },
          actions: {
            details: defaultData.stationDetails.stationDetailsUrl,
            write: `/~~/pages/nutalk/collection/post?station=~${defaultData.stationDetails.host}/collection_~${defaultData.stationDetails.collId}`
          }
        }
        break;

      case "collection-item":
        defaultData = this.getStationHeaderData(this.props.data.station);
        headerData = {
          ...defaultData,
          icon: IconBlog,
          title: {
            ...defaultData.title,
            display: (this.props.data.title) ? this.props.data.title : defaultData.title.display
          },
          actions: {
            edit: `/~~/~${defaultData.stationDetails.host}/==/web/collections/${defaultData.stationDetails.collId}/${this.props.data.postid}?edit=true`
          }
        }
        break;

      case "collection-write":
      case "collection-edit":
        defaultData = this.getStationHeaderData(this.props.data.station);
        headerData = {
          ...defaultData,
          icon: IconBlog,
          title: {
            ...defaultData.title,
            display: (this.props.data.title) ? this.props.data.title : defaultData.title.display
          },
          actions: {}
        }
        break;

      case "profile":
        headerData = {
          title: {
            display: "Profile",
            href: profileUrl(this.props.data.ship)
          }
        }
        break;

      case "dm":
      case "edit":
      case "default":
      default:
        headerData = {
          title: {
            display: "Inbox",
            href: "/~~/pages/nutalk"
          }
        }
        break;
    }

    return headerData;
  }

  buildHeaderContent(headerData) {
    let actions, subscribeClass, subscribeLabel, iconElem, breadcrumbsElem, headerClass, loadingClass;

    if (headerData.station) {
      subscribeClass = (this.isSubscribed(headerData.station)) ? "btn-secondary" : "btn-primary";
      subscribeLabel = (this.isSubscribed(headerData.station)) ? "Unsubscribe" : "Subscribe";
    }

    if (headerData.actions) {
      actions = Object.arrayify(headerData.actions).map(({key, value}) => {
        return (<a key={key} href={value} className="header-link mr-6">{key}</a>)
      })
    }

    if (headerData.breadcrumbs) {
      breadcrumbsElem = headerData.breadcrumbs.map(({display, href}, i) => {
        return (
          <React.Fragment>
            <a className="header-link header-link-breadcrumb" key={display} href={href}>{display}</a>
            <span className="header-link header-link-breadcrumb ml-2 mr-2">/</span>
          </React.Fragment>
        )
      })
    }

    iconElem = headerData.icon ? <headerData.icon /> : <div style={{width: "24px", height: "24px"}}></div>;
    loadingClass = getLoadingClass(this.props.store.views.transition);
    headerClass = classnames({
      'flex-3rd': true,
      'header-title': true,
      'header-title-mono': headerData.title && headerData.title.style === "mono"
    })

    return (
      <div>
        <div className="row">
          <div className="col-sm-offset-2 col-sm-10 header-breadcrumbs">
            {breadcrumbsElem}
          </div>
        </div>
        <div className="flex align-center header-mainrow">
          <div className={loadingClass}></div>
          <a onClick={this.toggleMenu} className="flex-1st">
            <div className="panini"></div>
          </a>
          <div className="flex-2nd">{iconElem}</div>
          <h3 className={headerClass}><a href={headerData.title.href}>{headerData.title.display}</a></h3>
          {actions}
          {headerData.station &&
            <Button
              classes={`btn btn-sm ${subscribeClass}`}
              action={this.toggleSubscribe}
              content={subscribeLabel}
              pushCallback={this.props.pushCallback}
              responseKey="circle.config.dif.source"
               />
          }
        </div>
      </div>
    )
  }

  render() {
    let type = (this.props.data.type) ? this.props.data.type : "default";

    console.log('header type = ', type);

    // TODO: This is an ugly hack until we fix queryParams
    if (["stream", "dm", "collection-write"].includes(type) && !getQueryParams().station) {
      return null;
    }

    let headerData = this.getHeaderData(type);
    let headerContent = this.buildHeaderContent(headerData);

    return (
      <div className="container header-container">
        {headerContent}
      </div>
    )
  }
}
