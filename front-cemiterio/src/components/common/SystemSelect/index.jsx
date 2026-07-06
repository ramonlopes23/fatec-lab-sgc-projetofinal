import { forwardRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { Select, SelectIcon, SelectWrapper } from "./styles";

const SystemSelect = forwardRef(function SystemSelect(
  {
    children,
    invalid = false,
    $invalid,
    className,
    style,
    disabled,
    onBlur,
    onChange,
    onFocus,
    onMouseDown,
    ...props
  },
  ref
) {
  const [open, setOpen] = useState(false);

  const handleBlur = (event) => {
    setOpen(false);
    onBlur?.(event);
  };

  const handleChange = (event) => {
    setOpen(false);
    onChange?.(event);
  };

  const handleFocus = (event) => {
    if (!disabled) setOpen(true);
    onFocus?.(event);
  };

  const handleMouseDown = (event) => {
    if (!disabled) setOpen(true);
    onMouseDown?.(event);
  };

  return (
    <SelectWrapper className={className} style={style}>
      <Select
        ref={ref}
        $invalid={invalid || $invalid}
        disabled={disabled}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onMouseDown={handleMouseDown}
        {...props}
      >
        {children}
      </Select>
      <SelectIcon $open={open} $disabled={disabled} aria-hidden="true">
        <LuChevronDown size={16} />
      </SelectIcon>
    </SelectWrapper>
  );
});

export default SystemSelect;
