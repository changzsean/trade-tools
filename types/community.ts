import type { ResourceType } from "./resource";

export type PostType =
  | "experience"
  | "question"
  | "resource_share"
  | "case_teardown"
  | "workflow_request"
  | "team_recruitment"
  | "partner_request"
  | "city_meetup"
  | "poll";

export interface CommunityPost {
  id: string;
  type: PostType;
  authorName: string;
  authorTitle: string;
  authorInitials: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  likes: number;
  comments: number;
  saves: number;
  attachedResourceType?: ResourceType;
}

export interface Question {
  id: string;
  title: string;
  tags: string[];
  answers: number;
  views: number;
  accepted: boolean;
  updatedAt: string;
}

export interface TeamOpportunity {
  id: string;
  title: string;
  goal: string;
  city: string;
  capacity: string;
  duration: string;
  roles: string[];
}
