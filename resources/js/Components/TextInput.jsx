import classNames from 'classnames';
import React, { forwardRef } from 'react';
const TextInput = forwardRef((props, ref) => (<input {...props} ref={ref} className={classNames('border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm', props.className)}/>));
export default TextInput;
