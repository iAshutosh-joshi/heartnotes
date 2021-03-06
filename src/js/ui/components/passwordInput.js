var $ = require('jquery');
var React = require('react');


var IconButton = require("./iconButton");



module.exports = React.createClass({
  propTypes: {
    placeholder : React.PropTypes.string,
    showToggleButton: React.PropTypes.bool,
    password : React.PropTypes.string,
    onChange : React.PropTypes.func,
    tabIndex: React.PropTypes.number,
    disabled: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      placeholder: 'Password',
      showToggleButton: false,
      password: '',
      onChange : null,
      tabIndex: 0,
      disabled: false,
    };
  },

  getInitialState: function() {
    return {
      showTyping: false,
    };
  },

  render: function() {
    var inputType = 'password',
      toggleElem = null;

    if (this.props.showToggleButton) {
      var toggleIcon = 'font',
        toggleText = 'Show',
        toggleTooltip = 'Show typing';

      if (this.state.showTyping) {
        inputType = 'text';  
        toggleIcon = 'circle';
        toggleText = 'Hide';
        toggleTooltip = 'Hide typing';
      }

      toggleElem = (
        <IconButton 
          className="toggle-button"
          ref="toggleButton"
          icon={toggleIcon} 
          onClick={this._toggleTyping}
          tooltip={toggleTooltip} />
      );
    }

    return (
      <div className="password-input">
        <input type={inputType}
          ref="input"
          onChange={this._onChange} 
          value={this.props.password} 
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          tabIndex={'' + this.props.tabIndex} />
        {toggleElem}
      </div>
    )
  },


  _onChange: function(e) {
    var password = $(e.currentTarget).val();

    if (this.props.onChange) {
      this.props.onChange(password);
    }
  },  


  _toggleTyping: function() {
    this.setState({
      showTyping: !this.state.showTyping
    });
  },

});


