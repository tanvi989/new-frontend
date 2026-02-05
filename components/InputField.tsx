import React from "react";
import { useField, FormikProps } from "formik";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  fullWidth?: boolean;
  formik?: FormikProps<any>;
  handleOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sameFieldName?: string;
  isSame?: boolean;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  fullWidth = false,
  formik,
  handleOnChange,
  sameFieldName,
  isSame,
  className = "",
  ...props
}) => {
  // useField needs a name to hook into Formik context
  const [field, meta] = useField(props.name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (props.name === "pin_code" && handleOnChange) {
      // Specific logic for pin_code from original file
      handleOnChange(e);
      // Ensure formik state is also updated if needed, though original code seemingly relied on handleOnChange
      if (!props.onChange) {
        field.onChange(e);
      }
    } else {
      if (formik) {
        // Legacy support for passing formik prop directly
        formik.setFieldValue(props.name, value);
        if (sameFieldName && isSame) {
          formik.setFieldValue(sameFieldName, value);
        }
      } else {
        // Standard Formik usage via hook
        field.onChange(e);
      }
    }
  };

  // Determine layout width.
  // If parent is a grid, col-span-full makes it full width.
  // If parent is block, w-full makes it full width.
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
          {label} {props.required && <span className="text-nav-red">*</span>}
        </label>
      )}
      <input
        {...field}
        {...props}
        id={props.id || props.name}
        onChange={handleChange}
        className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] focus:ring-1 focus:ring-[#232320] transition-colors ${
          meta.touched && meta.error
            ? "border-nav-red focus:border-nav-red focus:ring-nav-red"
            : ""
        } ${className}`}
      />
      {meta.touched && meta.error ? (
        <span className="text-nav-red text-xs mt-1 font-medium">
          {meta.error}
        </span>
      ) : null}
    </div>
  );
};

export default React.memo(InputField);
