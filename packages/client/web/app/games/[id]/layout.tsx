import { ReactNode } from "react";
import { GameDetailProvider } from "./game-details-context";

export default function Layout(props: {
  params: { id: string };
  children: ReactNode;
}) {
  return (
    <GameDetailProvider gameId={parseInt(props.params.id, 10)}>
      {props.children}
    </GameDetailProvider>
  );
}
