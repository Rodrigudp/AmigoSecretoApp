import type { ApiV1 } from "./contract";

export async function revokePush(
  api: Pick<ApiV1, "revokePush">,
  credential: string,
  expoPushToken: string,
  clearReceipt: () => Promise<void>
) {
  const response = await api.revokePush(credential, expoPushToken);
  if (!response.removed) throw new Error("Push removal was not confirmed");
  await clearReceipt();
}
