/**
 * Alliance System Types
 * 
 * Type definitions for alliance management
 */

/**
 * Alliance role
 */
export enum AllianceRole {
  Leader = 'leader',
  Officer = 'officer',
  Member = 'member'
}

/**
 * Invitation status
 */
export enum InvitationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Declined = 'declined',
  Expired = 'expired'
}

/**
 * Alliance member
 */
export interface AllianceMember {
  userId: string;
  allianceId: string;
  role: AllianceRole;
  joinedAt: number;
  contributionPoints?: number;
}

/**
 * Alliance interface
 */
export interface Alliance {
  id: string;
  name: string;
  tag: string;              // Short identifier (e.g., "LEAD")
  description?: string;
  leaderId: string;
  members: AllianceMember[];
  maxMembers: number;
  createdAt: number;
  updatedAt: number;
  settings: AllianceSettings;
  stats?: AllianceStats;
}

/**
 * Alliance settings
 */
export interface AllianceSettings {
  isPublic: boolean;        // Can anyone request to join?
  autoAccept: boolean;      // Auto-accept join requests?
  allowOfficerInvite: boolean;  // Can officers invite?
  sharedVision: boolean;    // Share territory vision?
  minLevel?: number;        // Minimum player level to join
}

/**
 * Alliance invitation
 */
export interface AllianceInvitation {
  id: string;
  allianceId: string;
  inviterId: string;
  inviteeId: string;
  status: InvitationStatus;
  message?: string;
  createdAt: number;
  expiresAt: number;
  respondedAt?: number;
}

/**
 * Alliance chat message
 */
export interface AllianceChatMessage {
  id: string;
  allianceId: string;
  senderId: string;
  content: string;
  createdAt: number;
  editedAt?: number;
  deletedAt?: number;
}

/**
 * Alliance statistics
 */
export interface AllianceStats {
  totalMembers: number;
  totalPlanets: number;
  totalShips: number;
  totalResources: {
    minerals: number;
    energy: number;
    credits: number;
  };
  averageLevel: number;
  rank?: number;
}

/**
 * Alliance action result
 */
export interface AllianceActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Create alliance request
 */
export interface CreateAllianceRequest {
  name: string;
  tag: string;
  description?: string;
  settings?: Partial<AllianceSettings>;
}

/**
 * Invite to alliance request
 */
export interface InviteToAllianceRequest {
  allianceId: string;
  inviteeId: string;
  message?: string;
}

/**
 * Alliance list query
 */
export interface AllianceListQuery {
  limit?: number;
  offset?: number;
  search?: string;
  publicOnly?: boolean;
  sortBy?: 'name' | 'members' | 'created';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Alliance member info (with user details)
 */
export interface AllianceMemberInfo extends AllianceMember {
  username: string;
  level: number;
  isOnline: boolean;
  lastActive: number;
}

/**
 * Alliance summary (for lists)
 */
export interface AllianceSummary {
  id: string;
  name: string;
  tag: string;
  description?: string;
  leaderName: string;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  createdAt: number;
}

/**
 * Shared vision data
 */
export interface SharedVisionData {
  allyId: string;
  allyName: string;
  planets: {
    id: string;
    name: string;
    position: { x: number; y: number };
    ownerId: string;
  }[];
  ships: {
    id: string;
    type: string;
    position: { x: number; y: number };
    ownerId: string;
  }[];
}

/**
 * Alliance event types
 */
export enum AllianceEventType {
  MemberJoined = 'member_joined',
  MemberLeft = 'member_left',
  MemberKicked = 'member_kicked',
  MemberPromoted = 'member_promoted',
  MemberDemoted = 'member_demoted',
  LeaderChanged = 'leader_changed',
  SettingsChanged = 'settings_changed',
  AllianceDisbanded = 'alliance_disbanded',
  InvitationSent = 'invitation_sent',
  InvitationAccepted = 'invitation_accepted',
  InvitationDeclined = 'invitation_declined'
}

/**
 * Alliance event
 */
export interface AllianceEvent {
  id: string;
  allianceId: string;
  type: AllianceEventType;
  actorId: string;
  targetId?: string;
  data?: any;
  timestamp: number;
}

/**
 * Alliance notification
 */
export interface AllianceNotification {
  type: AllianceEventType;
  message: string;
  alliance?: Alliance;
  data?: any;
  timestamp: number;
}
