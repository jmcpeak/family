import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FieldSelect } from "./editor-fields";

describe("FieldSelect", () => {
  it("does not call onChange repeatedly when value is missing from options", () => {
    const onChange = vi.fn();
    const options = [{ value: "", label: "" }];

    const { rerender } = render(
      <FieldSelect
        label="Father"
        value="missing-id"
        options={options}
        onChange={onChange}
      />,
    );

    rerender(
      <FieldSelect
        label="Father"
        value="missing-id"
        options={[{ value: "", label: "" }]}
        onChange={onChange}
      />,
    );

    rerender(
      <FieldSelect
        label="Father"
        value="missing-id"
        options={[{ value: "", label: "" }]}
        onChange={onChange}
      />,
    );

    expect(onChange.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it("does not call onChange when options array identity changes", () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <FieldSelect
        label="Father"
        value=""
        options={[{ value: "", label: "" }]}
        onChange={onChange}
      />,
    );

    for (let index = 0; index < 5; index += 1) {
      rerender(
        <FieldSelect
          label="Father"
          value=""
          options={[{ value: "", label: "" }]}
          onChange={onChange}
        />,
      );
    }

    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps out-of-range values selectable without firing onChange", () => {
    const onChange = vi.fn();

    render(
      <FieldSelect
        label="Father"
        value="missing-id"
        options={[{ value: "", label: "" }]}
        onChange={onChange}
      />,
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});
