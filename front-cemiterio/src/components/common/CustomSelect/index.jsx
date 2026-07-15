import React, { useEffect, useMemo, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import {
    CustomSelectButton,
    CustomSelectIcon,
    CustomSelectMenu,
    CustomSelectOption,
    CustomSelectPlaceholder,
    CustomSelectWrapper,
} from "./styles";

export default function CustomSelect({
    name,
    value,
    onChange,
    options = [],
    placeholder = "Selecione",
    renderValue,
    renderDropdown,
    getOptionLabel = (option) => option?.label ?? option?.value ?? "",
    getOptionValue = (option) => option?.value,
    getOptionDisabled = (option) => !!option?.disabled,
    disabled = false,
    className,
    style,
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selectedOption = useMemo(
        () => options.find((option) => String(getOptionValue(option)) === String(value)),
        [getOptionValue, options, value]
    );

    useEffect(() => {
        if (!open) return undefined;

        const handleDocumentClick = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleDocumentClick);
        return () => document.removeEventListener("mousedown", handleDocumentClick);
    }, [open]);

    const emitChange = (nextValue, option) => {
        onChange?.({
            target: {
                name,
                value: nextValue,
                option,
            },
        });
    };

    const handleSelect = (option) => {
        if (getOptionDisabled(option)) return;
        emitChange(getOptionValue(option), option);
        setOpen(false);
    };

    const selectOption = (option) => {
        if (!option) {
            emitChange("", null);
            setOpen(false);
            return;
        }

        handleSelect(option);
    };

    const displayValue = selectedOption ? (
        (renderValue?.(getOptionValue(selectedOption), selectedOption) ?? getOptionLabel(selectedOption))
    ) : (
        <CustomSelectPlaceholder>{placeholder}</CustomSelectPlaceholder>
    );

    return (
        <CustomSelectWrapper ref={wrapperRef} className={className} style={style}>
            <CustomSelectButton
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
            >
                <span>{displayValue}</span>
                <CustomSelectIcon $open={open}>
                    <LuChevronDown size={16} />
                </CustomSelectIcon>
            </CustomSelectButton>

            {open ? (
                <CustomSelectMenu role="listbox">
                    {renderDropdown
                        ? renderDropdown({
                              close: () => setOpen(false),
                              selectedOption,
                              selectOption,
                              value,
                          })
                        : options.map((option) => {
                              const optionValue = getOptionValue(option);
                              const optionLabel = getOptionLabel(option);
                              const optionDisabled = getOptionDisabled(option);

                              return (
                                  <CustomSelectOption
                                      key={String(optionValue)}
                                      type="button"
                                      role="option"
                                      aria-selected={String(optionValue) === String(value)}
                                      disabled={optionDisabled}
                                      $selected={String(optionValue) === String(value)}
                                      onClick={() => handleSelect(option)}
                                  >
                                      {optionLabel}
                                  </CustomSelectOption>
                              );
                          })}
                </CustomSelectMenu>
            ) : null}
        </CustomSelectWrapper>
    );
}
