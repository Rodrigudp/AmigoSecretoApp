import { createGroupAction } from "./actions";
import { CreateGroupForm } from "./_components/CreateGroupForm";

export default function Home() {
  return (
    <main id="conteudo" tabIndex={-1} className="page-shell page-shell--wide">
      <CreateGroupForm action={createGroupAction} />
    </main>
  );
}
