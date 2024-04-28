import { Games } from "./games";

type Props = {
  params: {
    id: string;
  };
};

export default function PlatformPage(props: Props) {
  const { id } = props.params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Games platform_id={id} />
    </main>
  );
}
