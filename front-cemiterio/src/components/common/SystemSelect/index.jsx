import { forwardRef } from "react";
import { Select } from "./styles";

const SystemSelect = forwardRef(function SystemSelect(
  { children, invalid = false, $invalid, ...props },
  ref
) {
  return (
    <Select ref={ref} $invalid={invalid || $invalid} {...props}>
      {children}
    </Select>
  );
});

export default SystemSelect;
