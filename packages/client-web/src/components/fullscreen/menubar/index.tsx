import { JobsIndicator } from "@/components/menubar/jobs-indicator";
import { useEffect, useState } from "react";
import { MenuSheet } from "./menu-sheet";
import { useSystemInfo } from "@/queries/useSystemInfo";
import { Image } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import logo from "@/assets/img/LogoLong-NoBackground-Small.png";

export function FullscreenMenubar(props: JSX.IntrinsicElements["div"]) {
  return (
    <div {...props}>
      <div className="px-2 py-1">
        <div className="relative grid place-items-center grid-flow-col auto-cols-fr p-0">
          <MenuSheet className="mr-auto" />

          <Image src={logo} alt="Retrom logo" className="h-6" />

          <div className="ml-auto flex gap-3 items-center">
            <JobsIndicator />
            <BatteryInfo />
            <SystemTime className="text-base font-medium pr-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemTime(props: JSX.IntrinsicElements["p"]) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p {...props}>
      {time.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "numeric",
      })}
    </p>
  );
}

function BatteryInfo(props: JSX.IntrinsicElements["div"]) {
  const { data: sysInfo } = useSystemInfo();

  if (!sysInfo?.batteries) {
    return null;
  }

  const { batteries } = sysInfo;

  const charge =
    batteries.reduce((acc, battery) => acc + battery.state_of_charge, 0) /
    batteries.length;

  return (
    <div {...props} className={cn("flex items-center h-full", props.className)}>
      <div
        style={{ "--charge": charge }}
        className="relative border border-white bg-background p-[2px]"
      >
        <div className="aspect-[2.5/1] bg-white h-[0.5rem] origin-left scale-x-[var(--charge)]" />
      </div>
    </div>
  );
}
