"use client";

import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast({
      title: "An error occurred",
      description: props.error.message,
      variant: "destructive",
    });
  }, [props.error]);

  return <>Something went wrong :(</>;
}
