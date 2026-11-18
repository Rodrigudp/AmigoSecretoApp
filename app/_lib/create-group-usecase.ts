import type { Result } from "@/src/shared/result";
import type { DomainError } from "@/src/domain/errors";
import type { CreateGroupData } from "./create-group-schema";

export type CreateGroupOutput = { inviteUrl: string; adminUrl: string };

/** RF01/RF02: wires the create-group use case to the Supabase GroupRepository. */
export async function createGroupUseCase(
  input: CreateGroupData
): Promise<Result<CreateGroupOutput, DomainError>> {
  const { createGroup } = await import("@/src/application/create-group");
  const { buildCreateGroupDeps } = await import("@/src/infrastructure/supabase/deps");
  return createGroup(input, buildCreateGroupDeps());
}
