/* eslint-disable func-names, space-before-function-paren, no-var, one-var, prefer-rest-params, max-len, vars-on-top, wrap-iife, consistent-return, comma-dangle, one-var-declaration-per-line, quotes, no-return-assign, prefer-arrow-callback, prefer-template, no-shadow, no-else-return, max-len, object-shorthand */
(function() {
  var bind = function(fn, me) { return function() { return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i += 1) { if (i in this && this[i] === item) return i; } return -1; };

  this.NewBranchForm = (function() {
    function NewBranchForm(form, availableRefs) {
      this.validate = bind(this.validate, this);
      this.branchNameError = form.find('.js-branch-name-error');
      this.name = form.find('.js-branch-name');
      this.ref = form.find('#ref');
      this.setupAvailableRefs(availableRefs);
      this.setupRestrictions();
      this.addBinding();
      this.init();
    }

    NewBranchForm.prototype.addBinding = function() {
      return this.name.on('blur', this.validate);
    };

    NewBranchForm.prototype.init = function() {
      if (this.name.length && this.name.val().length > 0) {
        return this.name.trigger('blur');
      }
    };

    NewBranchForm.prototype.setupAvailableRefs = function(availableRefs) {
      var $branchSelect = $('.js-branch-select');

      $branchSelect.glDropdown({
        data: availableRefs,
        filterable: true,
        filterByText: true,
        remote: false,
        fieldName: $branchSelect.data('field-name'),
        filterInput: 'input[type="search"]',
        selectable: true,
        isSelectable: function(branch, $el) {
          return !$el.hasClass('is-active');
        },
        text: function(branch) {
          return branch;
        },
        id: function(branch) {
          return branch;
        },
        toggleLabel: function(branch) {
          if (branch) {
            return branch;
          }
        }
      });

      const $dropdownContainer = $branchSelect.closest('.dropdown');
      const $fieldInput = $(`input[name="${$branchSelect.data('field-name')}"]`, $dropdownContainer);
      const $filterInput = $('input[type="search"]', $dropdownContainer);

      $filterInput.on('keyup', (e) => {
        const keyCode = e.keyCode || e.which;
        if (keyCode !== 13) return;

        const text = $filterInput.val();
        $fieldInput.val(text);
        $('.dropdown-toggle-text', $branchSelect).text(text);

        $dropdownContainer.removeClass('open');
      });
    };

    NewBranchForm.prototype.setupRestrictions = function() {
      var endsWith, invalid, single, startsWith;
      startsWith = {
        pattern: /^(\/|\.)/g,
        prefix: "can't start with",
        conjunction: "or"
      };
      endsWith = {
        pattern: /(\/|\.|\.lock)$/g,
        prefix: "can't end in",
        conjunction: "or"
      };
      invalid = {
        pattern: /(\s|~|\^|:|\?|\*|\[|\\|\.\.|@\{|\/{2,}){1}/g,
        prefix: "can't contain",
        conjunction: ", "
      };
      single = {
        pattern: /^@+$/g,
        prefix: "can't be",
        conjunction: "or"
      };
      return this.restrictions = [startsWith, invalid, endsWith, single];
    };

    NewBranchForm.prototype.validate = function() {
      var errorMessage, errors, formatter, unique, validator;
      this.branchNameError.empty();
      unique = function(values, value) {
        if (indexOf.call(values, value) === -1) {
          values.push(value);
        }
        return values;
      };
      formatter = function(values, restriction) {
        var formatted;
        formatted = values.map(function(value) {
          switch (false) {
            case !/\s/.test(value):
              return 'spaces';
            case !/\/{2,}/g.test(value):
              return 'consecutive slashes';
            default:
              return "'" + value + "'";
          }
        });
        return restriction.prefix + " " + (formatted.join(restriction.conjunction));
      };
      validator = (function(_this) {
        return function(errors, restriction) {
          var matched;
          matched = _this.name.val().match(restriction.pattern);
          if (matched) {
            return errors.concat(formatter(matched.reduce(unique, []), restriction));
          } else {
            return errors;
          }
        };
      })(this);
      errors = this.restrictions.reduce(validator, []);
      if (errors.length > 0) {
        errorMessage = $("<span/>").text(errors.join(', '));
        return this.branchNameError.append(errorMessage);
      }
    };

    return NewBranchForm;
  })();
}).call(window);
