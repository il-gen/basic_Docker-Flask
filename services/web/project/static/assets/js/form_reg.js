/**
* Checks that an element has a non-empty `name` and `value` property.
* @param  {Element} element  the element to check
* @return {Bool}             true if the element is an input, false if not
*/
const isValidElement = element => {
return element.name && element.value;
};

/**
* Checks if an element’s value can be saved (e.g. not an unselected checkbox).
* @param  {Element} element  the element to check
* @return {Boolean}          true if the value should be added, false if not
*/
const isValidValue = element => {
return (!['checkbox', 'radio'].includes(element.type) || element.checked);
};

/**
* Checks if an input is a checkbox, because checkboxes allow multiple values.
* @param  {Element} element  the element to check
* @return {Boolean}          true if the element is a checkbox, false if not
*/
const isCheckbox = element => element.type === 'checkbox';

/**
* Checks if an input is a `select` with the `multiple` attribute.
* @param  {Element} element  the element to check
* @return {Boolean}          true if the element is a multiselect, false if not
*/
const isMultiSelect = element => element.options && element.multiple;

/**
* Retrieves the selected options from a multi-select as an array.
* @param  {HTMLOptionsCollection} options  the options for the select
* @return {Array}                          an array of selected option values
*/
const getSelectValues = options => [].reduce.call(options, (values, option) => {
return option.selected ? values.concat(option.value) : values;
}, []);

/**
* A more verbose implementation of `formToJSON()` to explain how it works.
*
* NOTE: This function is unused, and is only here for the purpose of explaining how
* reducing form elements works.
*
* @param  {HTMLFormControlsCollection} elements  the form elements
* @return {Object}                               form data as an object literal
*/
const formToJSON_deconstructed = elements => {

// This is the function that is called on each element of the array.
const reducerFunction = (data, element) => {
  
  // Add the current field to the object.
  data[element.name] = element.value;
  
  // For the demo only: show each step in the reducer’s progress.
  console.log(JSON.stringify(data));

  return data;
};

// This is used as the initial value of `data` in `reducerFunction()`.
const reducerInitialValue = {};

// To help visualize what happens, log the inital value, which we know is `{}`.
console.log('Initial `data` value:', JSON.stringify(reducerInitialValue));

// Now we reduce by `call`-ing `Array.prototype.reduce()` on `elements`.
const formData = [].reduce.call(elements, reducerFunction, reducerInitialValue);

// The result is then returned for use elsewhere.
return formData;
};

/**
* Retrieves input data from a form and returns it as a JSON object.
* @param  {HTMLFormControlsCollection} elements  the form elements
* @return {Object}                               form data as an object literal
*/

const formToJSON = elements => [].reduce.call(elements, (data, element) => {

// Make sure the element has the required properties and should be added.
if (isValidElement(element) && isValidValue(element)) {

  /*
   * Some fields allow for more than one value, so we need to check if this
   * is one of those fields and, if so, store the values as an array.
   */
  
  if (isCheckbox(element)) {
    data[element.name] = (data[element.name] || []).concat(element.value);
  } else if (isMultiSelect(element)) {
    data[element.name] = getSelectValues(element);
  } else if (element.name in data) {
    if(isArray(data[element.name])){
      data[element.name]= data[element.name].concat(element.value);
    }else{
      prev_value=new Array(data[element.name]);
      data[element.name]=prev_value.concat(element.value);
    }
  } else {
    data[element.name] = element.value;
  }
}
return data;
}, {});




const isArray = (ob) => {
	return ob.constructor === Array;
}


const mapArrToInt = (arr)=>{
	var result = arr.map(function (x) { 
	  return parseInt(x); 
	});
	return result;
}



