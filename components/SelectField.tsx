import React from "react";
import { useField, FormikProps } from "formik";

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  name: string;
  startValue: number;
  endValue: number;
  step: number;
  fullWidth?: boolean;
  formik?: FormikProps<any>;
  sameFieldName?: string;
  isSame?: boolean;
  required?: boolean;
  placeholder?: string;
}

const getOptions = (startValue: number, endValue: number, step: number) => {
  let options: string[] = [];
  // Handle invalid step to prevent infinite loops
  if (step === 0) return [startValue.toFixed(2)];

  // Floating point arithmetic tolerance
  const epsilon = 0.0001;

  let i = startValue;
  if (startValue <= endValue) {
    // Ascending
    if (step < 0) return [];
    while (i <= endValue + epsilon) {
      options.push(i.toFixed(2));
      i += step;
    }
  } else {
    // Descending
    if (step > 0) return [];
    while (i >= endValue - epsilon) {
      options.push(i.toFixed(2));
      i += step;
    }
  }
  return options;
};

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  startValue,
  endValue,
  step,
  sameFieldName,
  isSame,
  fullWidth = false,
  formik,
  className = "",
  placeholder = "Select",
  ...props
}) => {
  const [field, meta] = useField(props.name);
  const options = getOptions(startValue, endValue, step);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (formik) {
      formik.setFieldValue(props.name, value);
      if (isSame && sameFieldName) {
        formik.setFieldValue(sameFieldName, value);
      }
    } else {
      // Fallback to standard formik handler if formik prop is not passed
      field.onChange(e);
    }
  };

  const containerClass = fullWidth
    ? "col-span-full w-full"
    : "col-span-1 w-full";

  return (
    <div className={`${containerClass} flex flex-col gap-2`}>
      {label && (
        <label
          htmlFor={props.id || props.name}
          className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
        >
          {label} {props.required}
        </label>
      )}
      <div className="relative">
        <select
          {...field}
          {...props}
          id={props.id || props.name}
          onChange={handleChange}
          className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-8 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors appearance-none cursor-pointer ${meta.touched && meta.error
              ? "border-nav-red focus:border-nav-red focus:ring-nav-red"
              : ""
            } ${className}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {meta.touched && meta.error ? (
        <span className="text-nav-red text-xs mt-1 font-medium">
          {meta.error}
        </span>
      ) : null}
    </div>
  );
};

export default React.memo(SelectField);
