// Client types derived from docs/arquitetura/API-V1.md §2–5.
export type Role = "participant" | "organizer";
export type Status = "open" | "drawn";

export interface GroupDetails {
  name: string;
  maxValueCents: number;
  exchangeDate: string;
  location: string | null;
}

export interface Summary {
  groupId: string;
  groupName: string;
  role: Role;
  displayName: string | null;
  status: Status;
  exchangeDate: string;
  maxValueCents: number;
  expiresAt: string;
}

export interface CreateGroup extends GroupDetails {
  requestId: string;
}

export interface CreatedGroup {
  inviteUrl: string;
  adminUrl: string;
  inviteToken: string;
  adminToken: string;
}

export interface Invitation {
  groupId: string;
  group: GroupDetails & { status: Status };
  isFull: boolean;
  returningParticipant: { displayName: string } | null;
  expiresAt: string;
}

export interface JoinedGroup {
  displayName: string;
  personalUrl: string;
  accessToken: string;
  groupId: string;
  expiresAt: string;
}

export interface WishDraft {
  title: string;
  url: string | null;
  note: string | null;
}

export interface Wish extends WishDraft {
  id: string;
}

export interface Participant {
  groupId: string;
  expiresAt: string;
  view: {
    displayName: string;
    group: GroupDetails & { status: Status };
    ownWishItems: Wish[];
  };
}

export interface Reveal {
  drawVersion: number;
  recipientName: string;
  wishItems: Wish[];
}

export interface Admin {
  group: GroupDetails;
  inviteUrl: string;
  draw: { status: Status };
  participantCount: number;
  participants: { id: string; displayName: string; joinedAt: string }[];
}

export interface PushRegistration {
  expoPushToken: string;
  platform: "ios" | "android";
}

export interface ApiV1 {
  create(input: CreateGroup): Promise<CreatedGroup>;
  summary(credential: string): Promise<Summary>;
  invitation(credential: string, resume?: string): Promise<Invitation>;
  join(credential: string, displayName: string): Promise<JoinedGroup>;
  participant(credential: string): Promise<Participant>;
  wishes(credential: string): Promise<{ items: Wish[] }>;
  addWish(credential: string, input: WishDraft): Promise<{ item: Wish }>;
  updateWish(credential: string, id: string, input: WishDraft): Promise<{ item: Wish }>;
  removeWish(credential: string, id: string): Promise<{ id: string }>;
  reveal(credential: string): Promise<Reveal>;
  admin(credential: string): Promise<Admin>;
  removeParticipant(credential: string, id: string): Promise<{ participantCount: number }>;
  draw(
    credential: string,
    expectedParticipantCount: number
  ): Promise<{ status: "drawn"; drawnAt: string }>;
  registerPush(
    credential: string,
    input: PushRegistration
  ): Promise<{ registered: true; role: Role }>;
}
