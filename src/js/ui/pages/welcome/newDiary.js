var React = require('react');

var faker = require('faker')

var Button = require('../../components/button'),
  NewPasswordInput = require('../../components/newPasswordInput'),
  PasswordCheckProgressPopup = require('../../components/passwordCheckProgressPopup');



module.exports = React.createClass({
  propTypes: {
    showStep: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      showStep: null,
    };
  },

  getInitialState: function() {
    return {
      password: null,
    }
  },

  render: function() { 
    var buttonAttrs = {
      onClick: this._savePassword,
      animActive: !!this.props.nowDerivingKeys,
    };

    if (!this.state.password || !this.state.password.length) {
      buttonAttrs.disabled = true;
    }

    return (
      <div className="new-diary step">
        <p className="info">Please enter a password to encrypt your diary with.</p>
        <ul>
          <li>Use A to Z, numbers and symbols altogether to ensure a strong password.</li>
          <li>Do not forget it! if you forget your password you will NOT be able to open your diary.</li>
        </ul>        
        <form>
          <div className="field row">
            <NewPasswordInput setPassword={this._setPassword} requiredStrength={1} />
          </div>
          <div className="field row">
            <PasswordCheckProgressPopup {...this.props}>
              <Button {...buttonAttrs}>Next</Button>
            </PasswordCheckProgressPopup>
          </div>
        </form>
      </div>
    );
  },


  componentDidUpdate: function() {
    if (this.props.derivedKeys) {
      this.props.showStep('loadDiary');
    }
  },

  _setPassword: function(passwd) {
    this.setState({
      password: passwd
    });
  },

  _savePassword: function() {
    this.props.flux.getActions('user')
      .saveNewDataFile(faker.name.firstName(), this.state.password);
  },


});

