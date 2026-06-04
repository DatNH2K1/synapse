import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import FormSelect from "@/components/shared/FormSelect";

describe("components/shared/FormSelect", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
  ];

  it("should render select options and label", () => {
    cleanup();
    render(<FormSelect label="Choose option" options={options} defaultValue="opt1" />);
    
    expect(screen.getByText("Choose option")).toBeDefined();
    expect(screen.getByText("Option 1")).toBeDefined();
    expect(screen.getByText("Option 2")).toBeDefined();
  });

  it("should fire onChange event when select option changes", () => {
    cleanup();
    const handleChange = vi.fn();
    render(<FormSelect options={options} onChange={handleChange} />);
    
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "opt2" } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(select.value).toBe("opt2");
  });
});
