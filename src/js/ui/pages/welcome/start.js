var _ = require('lodash'),
  React = require('react');

var Detect = require('../../../utils/detect'),
  StringUtils = require('../../../utils/string'),
  Button = require('../../components/button'),
  IconButton = require("../../components/iconButton"),
  Popup = require("../../components/popup"),
  PasswordInput = require('../../components/passwordInput'),
  OpenDiaryProgressPopup = require('../../components/openDiaryProgressPopup');


import { connectRedux } from '../../helpers/decorators';



var Component = React.createClass({
  propTypes: {
    showStep: React.PropTypes.func.isRequired,
    isActive: React.PropTypes.bool.isRequired,
  },

  getInitialState: function() {
    return {
      password: null,
    };
  },

  render: function() { 
    var content = null;

    if (this.props.data.diary.lastAccessedDiaryDetails) {
      var lastDiaryName = StringUtils.formatDiaryName(
        this.props.data.diary.lastAccessedDiaryDetails.name
      );

      var buttonAttrs = {
        onClick: this._openDiary,
        animActive: !!this.props.data.diary.opening.inProgress,
      };

      if (!this.state.password || !this.state.password.length) {
        buttonAttrs.disabled = true;
      }

      content = (
        <div className="open-existing">
          <p>
            <label>Diary:</label>
            <span>{lastDiaryName}</span>
            {this._buildChooseAnotherDiaryButton()}
          </p>
          <form onSubmit={this._openDiary}>
            <div className="field row">
              <PasswordInput password={this.state.password} onChange={this._setPassword} />
            </div>
            <div className="action row">
              <OpenDiaryProgressPopup {...this.props}>
                <Button {...buttonAttrs}>Open</Button>
              </OpenDiaryProgressPopup>
            </div>
          </form>
        </div>
      );
    } else {
      content = (
        <div className="open-existing">
          <p>
            <label>Open existing diary</label>
            {this._buildChooseAnotherDiaryButton()}
          </p>
        </div>
      );
    }


    content = (
      <div>
        {content}
        <div className="create-new">
          <Button onClick={this._createNew}>Create new diary</Button>
        </div>
      </div>
    );

    return (
      <div className="start step">
        {content}
      </div>
    );
  },



  _buildChooseAnotherDiaryButton: function() {
    if (Detect.isElectronApp()) {
      let choosingError = this.props.data.diary.choosing.error;

      let popupMsg = (!!choosingError)
        ? (<div>{'' + choosingError}</div>)
        : null;

      return (
        <span className="choose-diary">
          <Popup 
              msg={popupMsg} 
              show={!!choosingError}>
            <IconButton 
              ref="chooseDiaryButton"
              icon="folder-open"
              onClick={this._chooseDiary}
              tooltip="Choose a diary" />
          </Popup>
        </span>
      );
    } else {
      return null;
    }
  },


  _openDiary: function(e) {
    e.preventDefault();

    this.props.actions.openDiary(
      _.get(this.props.data.diary.lastAccessedDiaryDetails, 'name'),
      this.state.password
    )
      .then(() => {
        this.props.showStep('loadDiary');
      });
  },


  _setPassword: function(p) {
    this.setState({
      password: p,
    });
  },


  _createNew: function() {
    this.props.showStep('newDiary');
  },


  _chooseDiary: function() {    
    this.props.actions.chooseDiary();
  },

});


module.exports = connectRedux([
  'chooseDiary',
  'openDiary'
])(Component);



