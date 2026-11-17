import { createGroupAction } from "./actions";
import { CreateGroupForm } from "./_components/CreateGroupForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <CreateGroupForm action={createGroupAction} />
    </main>
  );
}
