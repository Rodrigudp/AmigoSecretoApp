import { ApiError } from "./client";
import type { ApiV1, GroupDetails, Role, Status, Wish } from "./contract";

const expiresAt = "2027-02-22T23:59:59.999Z";
const origin = "https://papelzinho.app";
const example: GroupDetails = {
  name: "Família Silva",
  maxValueCents: 5000,
  exchangeDate: "2026-12-20",
  location: "Casa da vó",
};

export function createMockApi(): ApiV1 {
  let group = example;
  let groupId = "demo";
  let status: Status = "open";
  let inviteToken = "demo-invite";
  let adminToken = "demo-admin";
  const members = new Map([
    ["demo-participant", { id: "1", displayName: "Ana" }],
    ["demo-bruno", { id: "2", displayName: "Bruno" }],
    ["demo-carla", { id: "3", displayName: "Carla" }],
  ]);
  const lists = new Map<string, Wish[]>([
    ["demo-participant", [{ id: "4", title: "Livro de receitas", url: null, note: "Capa dura" }]],
  ]);
  let next = 5;

  const invalid = () => new ApiError("INVALID_LINK", "Este link não está disponível.");
  function member(token: string) {
    const value = members.get(token);
    if (!value) throw invalid();
    return value;
  }
  function admin(token: string) {
    if (token !== adminToken) throw invalid();
  }
  function invite(token: string) {
    if (token !== inviteToken) throw invalid();
  }
  function list(token: string) {
    member(token);
    return lists.get(token) ?? [];
  }
  function role(token: string): Role {
    if (token === adminToken) return "organizer";
    member(token);
    return "participant";
  }

  return {
    async create({ requestId, ...details }) {
      group = details;
      groupId = requestId;
      status = "open";
      members.clear();
      lists.clear();
      inviteToken = `demo-invite-${requestId}`;
      adminToken = `demo-admin-${requestId}`;
      return {
        inviteToken,
        adminToken,
        inviteUrl: `${origin}/g/${inviteToken}`,
        adminUrl: `${origin}/admin/${adminToken}`,
      };
    },
    async summary(token) {
      return {
        groupId,
        groupName: group.name,
        role: role(token),
        displayName: members.get(token)?.displayName ?? null,
        status,
        exchangeDate: group.exchangeDate,
        maxValueCents: group.maxValueCents,
        expiresAt,
      };
    },
    async invitation(token, resume) {
      invite(token);
      const returning = resume && members.get(resume);
      return {
        groupId,
        group: { ...group, status },
        isFull: members.size >= 100,
        returningParticipant: returning ? { displayName: returning.displayName } : null,
        expiresAt,
      };
    },
    async join(token, displayName) {
      invite(token);
      if (status === "drawn") throw new ApiError("GROUP_CLOSED", "As entradas estão encerradas.");
      const id = String(next++);
      const accessToken = `demo-participant-${id}`;
      members.set(accessToken, { id, displayName });
      return {
        displayName,
        personalUrl: `${origin}/p/${accessToken}`,
        accessToken,
        groupId,
        expiresAt,
      };
    },
    async participant(token) {
      return {
        groupId,
        expiresAt,
        view: {
          displayName: member(token).displayName,
          group: { ...group, status },
          ownWishItems: list(token),
        },
      };
    },
    async wishes(token) {
      return { items: list(token) };
    },
    async addWish(token, input) {
      const items = list(token);
      if (items.length >= 20)
        throw new ApiError(
          "WISH_LIST_FULL",
          "Você chegou a 20 presentes. Apague um para adicionar outro."
        );
      const item = { ...input, id: String(next++) };
      lists.set(token, [...items, item]);
      return { item };
    },
    async updateWish(token, id, input) {
      const items = list(token);
      if (!items.some((item) => item.id === id))
        throw new ApiError("WISH_ITEM_NOT_FOUND", "Este presente não está mais na lista.");
      const item = { ...input, id };
      lists.set(
        token,
        items.map((previous) => (previous.id === id ? item : previous))
      );
      return { item };
    },
    async removeWish(token, id) {
      lists.set(
        token,
        list(token).filter((item) => item.id !== id)
      );
      return { id };
    },
    async reveal(token) {
      member(token);
      if (status !== "drawn")
        throw new ApiError("DRAW_NOT_READY", "O sorteio ainda não foi realizado.");
      const ordered = [...members.keys()];
      const recipient = ordered[(ordered.indexOf(token) + 1) % ordered.length];
      return {
        drawVersion: 1,
        recipientName: member(recipient).displayName,
        wishItems: list(recipient),
      };
    },
    async admin(token) {
      admin(token);
      return {
        group,
        inviteUrl: `${origin}/g/${inviteToken}`,
        draw: { status },
        participantCount: members.size,
        participants: [...members.values()].map((value) => ({
          ...value,
          joinedAt: "2026-11-18T18:00:00.000Z",
        })),
      };
    },
    async removeParticipant(token, id) {
      admin(token);
      if (status === "drawn") throw new ApiError("GROUP_CLOSED", "As entradas estão encerradas.");
      for (const [key, value] of members)
        if (value.id === id) {
          members.delete(key);
          lists.delete(key);
        }
      return { participantCount: members.size };
    },
    async draw(token, expected) {
      admin(token);
      if (members.size !== expected)
        throw new ApiError(
          "DRAW_MEMBERS_CHANGED",
          "O número de pessoas mudou. Atualize a página e confira antes de sortear."
        );
      if (members.size < 3)
        throw new ApiError(
          "NOT_ENOUGH_PARTICIPANTS",
          "Para sortear, precisa de pelo menos 3 pessoas."
        );
      status = "drawn";
      return { status, drawnAt: new Date().toISOString() };
    },
    async registerPush(token) {
      return { registered: true, role: role(token) };
    },
  };
}
