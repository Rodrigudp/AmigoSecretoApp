import type { Pair, ParticipantId } from "../domain/draw";
import type { DomainError } from "../domain/errors";
import type { Result } from "../shared/result";

export type { Pair, ParticipantId } from "../domain/draw";

export type GroupId = string;
export type WishItemId = string;
export type GroupStatus = "open" | "drawn";

export type GroupDetails = {
  name: string;
  maxValueCents: number;
  exchangeDate: string;
  location: string | null;
};

export type DrawReceipt = { status: "drawn"; drawnAt: string };
export type RevealedResult = {
  drawVersion: number;
  recipientName: string;
  wishItems: RevealedWishItem[];
};

export type DrawState = { status: "open" } | DrawReceipt;
export type WishFields = { title: string; url: string | null; note: string | null };
export type AffiliateStore = "amazon";
export type ProductLink =
  | { href: string; affiliate: false; store: null }
  | { href: string; affiliate: true; store: AffiliateStore };
export type WishItem = WishFields & { id: WishItemId; productLink: ProductLink | null };
export type RevealedWishItem = Omit<WishItem, "url"> & { url?: string | null };
export type SaveWishItemOutput = { item: WishItem; warning: "AFFILIATE_UNAVAILABLE" | null };

export type PublicGroup = GroupDetails & { status: GroupStatus };
export type AdminGroup = {
  group: GroupDetails;
  inviteUrl: string;
  draw: DrawState;
  participantCount: number;
  participants: { id: ParticipantId; displayName: string; joinedAt: string }[];
};
export type ParticipantView = {
  displayName: string;
  group: PublicGroup;
  ownWishItems: WishItem[];
};
export type OwnerMetrics = {
  groupsCreated: number;
  participantsJoined: number;
  participantsPerGroup: { groupId: GroupId; count: number }[];
  inviteConversionRate: number | null;
  affiliateClicks: number;
};

export type RepositoryResult<T> = Promise<Result<T, DomainError>>;
export type AccessScope = { participantId: ParticipantId; accessTokenHash: string };
export type AdminScope = { groupId: GroupId; adminTokenHash: string };
export type StoredWishFields = WishFields & {
  affiliateUrl: string | null;
  store: AffiliateStore | null;
};
export type NewGroup = GroupDetails & {
  inviteToken: string;
  adminTokenHash: string;
  requestId: string;
  expiresAt: string;
};

export interface GroupRepository {
  createOrRotateAdminToken(
    input: NewGroup
  ): RepositoryResult<{ groupId: GroupId; inviteToken: string }>;
  findByInvite(token: string): Promise<{ groupId: GroupId; view: PublicGroup } | null>;
  findAdminByHash(hash: string): Promise<AdminScope | null>;
  getAdminView(admin: AdminScope): RepositoryResult<AdminGroup>;
  removeParticipant(
    admin: AdminScope,
    participantId: ParticipantId
  ): RepositoryResult<{ participantCount: number }>;
}

export interface ParticipantRepository {
  join(input: {
    inviteToken: string;
    displayName: string;
    accessTokenHash: string;
  }): RepositoryResult<{ displayName: string; groupId: GroupId; expiresAt: string }>;
  findActiveByHash(hash: string): Promise<
    | (AccessScope & {
        groupId: GroupId;
        displayName: string;
        /** Group expiration (RN08) used as the `ptk_<groupId>` cookie expiry (ADR-004). */
        expiresAt: string;
      })
    | null
  >;
  getView(access: AccessScope): RepositoryResult<ParticipantView>;
}

export interface WishItemRepository {
  listOwn(access: AccessScope): RepositoryResult<WishItem[]>;
  addOwn(access: AccessScope, item: StoredWishFields): RepositoryResult<WishItem>;
  updateOwn(
    access: AccessScope,
    itemId: WishItemId,
    item: StoredWishFields
  ): RepositoryResult<WishItem>;
  deleteOwn(access: AccessScope, itemId: WishItemId): RepositoryResult<{ id: WishItemId }>;
  getVisibleLink(
    access: AccessScope,
    itemId: WishItemId
  ): RepositoryResult<{
    groupId: GroupId;
    url: string;
    affiliateUrl: string | null;
  }>;
  getLinkForRedirect(
    itemId: WishItemId
  ): RepositoryResult<{
    groupId: GroupId;
    url: string;
    affiliateUrl: string | null;
  }>;
}

export interface DrawRepository {
  readForFirstDraw(
    admin: AdminScope
  ): RepositoryResult<{ status: "open"; participantIds: ParticipantId[] } | DrawReceipt>;
  commitFirstDraw(
    admin: AdminScope,
    expectedParticipantIds: readonly ParticipantId[],
    pairs: readonly Pair[]
  ): RepositoryResult<DrawReceipt>;
  getCurrentResult(
    access: AccessScope,
    options?: { includeOriginalUrl?: boolean }
  ): RepositoryResult<RevealedResult>;
}

export interface TokenService {
  generate(): string;
  hash(token: string): string;
}

export interface Clock {
  now(): Date;
}

export interface AffiliateLinkService {
  convert(url: string): Promise<{ affiliateUrl: string; store: AffiliateStore } | null>;
  canRedirect(destinationUrl: string): boolean;
}

export type EventType =
  | "group_created"
  | "invite_opened"
  | "participant_joined"
  | "draw_performed"
  | "result_revealed"
  | "affiliate_click";

export interface EventRepository {
  append(event: { groupId: GroupId; type: EventType }): Promise<void>;
  readOwnerMetrics(): Promise<OwnerMetrics>;
}
