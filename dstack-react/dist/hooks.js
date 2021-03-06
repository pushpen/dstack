var react = require('react');
var lodashEs = require('lodash-es');

var usePrevious = (function (value) {
  var ref = react.useRef(value);
  react.useEffect(function () {
    ref.current = value;
  }, [value]);
  return ref.current;
});

var useOnClickOutside = (function (ref, handler) {
  react.useEffect(function () {
    var listener = function listener(event) {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return function () {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
});

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var isEmail = function isEmail(value) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
};
var isRequired = function isRequired(value) {
  return !(value === null || value === undefined || value === '');
};
var noSpaces = function noSpaces(value) {
  return /^[\S]*$/.test(value);
};
var isValidStackName = function isValidStackName(value) {
  return /^[^\/]/.test(value) && /^[a-zA-Z0-9\/_]+$/.test(value);
};

var validationMap = {
  required: isRequired,
  email: isEmail,
  'no-spaces-stack': noSpaces,
  'stack-name': isValidStackName
};

var getValidationFunction = function getValidationFunction(validator) {
  if (typeof validator === 'string' && validationMap[validator]) return validationMap[validator];
  if (typeof validator === 'function') return validator;
  return function () {
    return true;
  };
};

var useForm = (function (initialFormState, fieldsValidators) {
  if (fieldsValidators === void 0) {
    fieldsValidators = {};
  }

  var _useState = react.useState(initialFormState),
      form = _useState[0],
      setForm = _useState[1];

  var _useState2 = react.useState({}),
      formErrors = _useState2[0],
      setFormErrors = _useState2[1];

  var onChange = function onChange(eventOrName, value) {
    var _extends2, _extends3;

    var name;
    var fieldValue;

    if (eventOrName.target) {
      var event = eventOrName;
      fieldValue = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      name = event.target.name;
    } else {
      name = eventOrName;
      fieldValue = value;
    }

    setForm(_extends({}, form, (_extends2 = {}, _extends2[name] = fieldValue, _extends2)));
    setFormErrors(_extends({}, formErrors, (_extends3 = {}, _extends3[name] = [], _extends3)));
  };

  var resetForm = function resetForm() {
    setForm(initialFormState);
    setFormErrors({});
  };

  var getFieldErrors = function getFieldErrors(fieldName) {
    var errors = [];
    if (Array.isArray(fieldsValidators[fieldName])) fieldsValidators[fieldName].forEach(function (validator) {
      var isValid = getValidationFunction(validator);
      if (!isValid(form[fieldName])) errors.push(validator);
    });

    if (typeof fieldsValidators[fieldName] === 'string') {
      var isValid = getValidationFunction(fieldsValidators[fieldName]);
      if (!isValid(form[fieldName])) errors.push(fieldsValidators[fieldName]);
    }

    return errors;
  };

  var checkValidForm = function checkValidForm() {
    var isValid = true;
    var newFormErrors = {};
    Object.keys(fieldsValidators).forEach(function (fieldName) {
      var errors = getFieldErrors(fieldName);
      newFormErrors[fieldName] = errors;
      isValid = isValid && !errors.length;
    });
    setFormErrors(newFormErrors);
    return isValid;
  };

  return {
    form: form,
    setForm: setForm,
    formErrors: formErrors,
    setFormErrors: setFormErrors,
    resetForm: resetForm,
    onChange: onChange,
    checkValidForm: checkValidForm
  };
});

var useIntersectionObserver = (function (callBack, _ref, deps) {
  var _ref$rootMargin = _ref.rootMargin,
      rootMargin = _ref$rootMargin === void 0 ? '0px' : _ref$rootMargin,
      _ref$threshold = _ref.threshold,
      threshold = _ref$threshold === void 0 ? 0.01 : _ref$threshold,
      _ref$root = _ref.root,
      root = _ref$root === void 0 ? null : _ref$root;
  var ref = react.useRef(null);
  var intersectionCallback = react.useCallback(function (_ref2) {
    var target = _ref2[0];

    if (target.isIntersecting) {
      callBack();
    }
  }, deps);
  react.useEffect(function () {
    var options = {
      root: root,
      rootMargin: rootMargin,
      threshold: threshold
    };
    var observer = new IntersectionObserver(intersectionCallback, options);
    if (ref && ref.current) observer.observe(ref.current);
    return function () {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, intersectionCallback]);
  return [ref];
});

var useDebounce = (function (callback, depsOrDelay, deps) {
  var delay = 300;
  if (typeof depsOrDelay === 'number') delay = depsOrDelay;else deps = depsOrDelay;
  return react.useCallback(lodashEs.debounce(callback, delay), deps);
});

var useTimeout = function useTimeout(callback, timeout) {
  if (timeout === void 0) {
    timeout = 0;
  }

  var timeoutIdRef = react.useRef();
  var cancel = react.useCallback(function () {
    var timeoutId = timeoutIdRef.current;

    if (timeoutId) {
      timeoutIdRef.current = undefined;
      clearTimeout(timeoutId);
    }
  }, [timeoutIdRef]);
  react.useEffect(function () {
    timeoutIdRef.current = setTimeout(callback, timeout);
    return cancel;
  }, [callback, timeout, cancel]);
  return cancel;
};

exports.useDebounce = useDebounce;
exports.useForm = useForm;
exports.useIntersectionObserver = useIntersectionObserver;
exports.useOnClickOutside = useOnClickOutside;
exports.usePrevious = usePrevious;
exports.useTimeout = useTimeout;
//# sourceMappingURL=hooks.js.map
