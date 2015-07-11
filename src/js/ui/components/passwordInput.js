var $ = require('jquery');
var React = require('react');


var IconButton = require("./iconButton");



module.exports = React.createClass({
  propTypes: {
    placeholder : React.PropTypes.string,
    showToggleButton: React.PropTypes.bool,
    password : React.PropTypes.string,
    onChange : React.PropTypes.func,
    tabIndex: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      placeholder: 'Enter password',
      showToggleButton: false,
      password: '',
      onChange : null,
      tabIndex: "",
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
      var toggleIcon = 'bold',
        toggleTooltip = 'Show typing';

      if (this.state.showTyping) {
        inputType = 'text';  
        toggleIcon = 'circle';
        toggleTooltip = 'Hide typing';
      }

      toggleElem = (
        <IconButton 
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
          onInput={this._onChange} 
          defaultValue={this.props.password} 
          placeholder={this.props.placeholder}
          tabIndex={this.props.tabIndex} />
        {toggleElem}
      </div>
    )
  },


  componentDidMount: function() {
    this._updateToggleButtonPosition();
  },


  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps.showToggleButton !== this.props.showToggleButton) {
      this._updateToggleButtonPosition();
    }
  },


  _updateToggleButtonPosition: function() {
    if (this.props.showToggleButton) {
      var $input = $(React.findDOMNode(this.refs.input)),
        $toggleButton = $(React.findDOMNode(this.refs.toggleButton));

      var inputPos = $input.position();

      $toggleButton.css({
        position: 'absolute',
        left: (inputPos.left + $input.outerWidth() + 20) + 'px',
        top: (inputPos.top + ($input.outerHeight() - $toggleButton.outerHeight()) / 2) + 'px',
      });
    }
  },


  _onChange: function(e) {
    var password = $(e.currentTarget).val();

    if (this.props.onChange) {
      this.props.onChange(password);
    }
  },  


  _toggleTyping: function(e) {
    e.preventDefault();

    this.setState({
      showTyping: !this.state.showTyping
    });
  },

});


