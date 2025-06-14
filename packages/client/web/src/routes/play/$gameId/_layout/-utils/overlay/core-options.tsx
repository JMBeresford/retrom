import {
  ConfigSelect,
  ConfigSelectItem,
} from "@/components/fullscreen/menubar/config-inputs/select";
import {
  CoreOption,
  useCoreOptions,
} from "@/providers/emulator-js/core-options";
import { memo, useState } from "react";
import { OverlayMenuItem } from ".";

export const coreOptions: OverlayMenuItem = {
  label: "Core Options",
  items: [{ Render: CoreOptions }],
};

function CoreOptions() {
  const { coreOptions } = useCoreOptions();

  return (
    <>
      {Object.entries(coreOptions).map(([label, opts]) => (
        <Option key={label} label={label} opts={opts} />
      ))}
    </>
  );
}

const Option = memo(function Option(props: {
  label: string;
  opts: CoreOption;
}) {
  const [open, setOpen] = useState(false);
  const {
    label,
    opts: { value, allValues },
  } = props;
  const { setCoreOption } = useCoreOptions();

  return (
    <div key={label}>
      <ConfigSelect
        value={value}
        open={open}
        onValueChange={(newValue) => setCoreOption(label, newValue)}
        onOpenChange={(value) => {
          setOpen(value);
        }}
        triggerProps={{
          label,
          id: label,
          className: "scroll-my-16",
        }}
      >
        {allValues
          .filter((v) => open || v === value)
          .map((val) => (
            <ConfigSelectItem key={val} value={val}>
              {val}
            </ConfigSelectItem>
          ))}
      </ConfigSelect>
    </div>
  );
});
