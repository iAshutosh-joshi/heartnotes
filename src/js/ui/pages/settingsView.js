var _ = require('lodash'),
  React = require('react');

var moment = require('moment');

var Button = require('../components/button'),
  ChangePasswordProgressPopup = require('../components/changePasswordProgressPopup'),
  PasswordInput = require('../components/passwordInput'),
  NewPasswordInput = require('../components/newPasswordInput');


module.exports = React.createClass({
  getInitialState: function() {
    return {
      oldPassword: null,
      newPassword: null,
    }
  },

  render: function() { 
    var changePasswordButtonAttrs = {
      onClick: this._saveNewPassword,
      animActive: !!this.props.nowChangingPassword,
    };

    if (!_.get(this.state.oldPassword, 'length') || !_.get(this.state.newPassword, 'length')) {
      changePasswordButtonAttrs.disabled = true;
    }

    return (
      <div className="settingsView">
        <h1>Change password</h1>
        <form onSubmit={this._changePassword}>
          <div className="field row">
            <PasswordInput 
              password={this.state.oldPassword} 
              placeholder="Current password"
              onChange={this._setOldPassword} />
          </div>
          <div className="input-fields row">
            <NewPasswordInput 
              password={this.state.newPassword} 
              passwordPlaceholder="New password"
              confirmPlaceholder="Confirm new password"
              onChange={this._setNewPassword} 
              requiredStrength={1} />
          </div>
          <div className="action row">
            <ChangePasswordProgressPopup {...this.props}>
              <Button {...changePasswordButtonAttrs}>Save</Button>
            </ChangePasswordProgressPopup>
          </div>
        </form>
      </div>
    );
  },


  _setOldPassword: function(password) {
    this.setState({
      oldPassword: password
    });
  },

  _setNewPassword: function(password) {
    this.setState({
      newPassword: password
    });
  },


  _saveNewPassword: function() {
    this.props.flux.getActions('user').changePassword(
      this.state.oldPassword, this.state.newPassword
    );
  },

});