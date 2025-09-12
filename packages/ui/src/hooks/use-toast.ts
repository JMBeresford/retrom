import * as React from "react";

import { toast } from "../components/toast";

function useToast() {
  return React.useMemo(() => ({ toast }), []);
}

export { useToast, toast };
