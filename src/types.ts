export type PostCategory = 
  | 'Announcements'
  | 'Advisories & Memos'
  | 'Campus Events'
  | 'Achievements'
  | 'Academic Updates';

export interface PostItem {
  id: string;
  title: string;
  slug: string;
  category: PostCategory;
  date: string;
  author: string;
  summary: string;
  content: string;
  pinned?: boolean;
  imageUrl?: string;
  galleryImages?: string[];
  tags?: string[];
  department?: string;
}

export interface SchoolInfo {
  name: string;
  schoolId: string;
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  district: string;
  division: string;
  region: string;
  country: string;
  email: string;
  contactNumber: string;
  schoolHead: string;
  headTitle: string;
  motto: string;
  logoUrl: string | null;
  announcementTicker: string;
  academicYear: string;
  elementaryEnrolled: number;
  secondaryEnrolled: number;
  teachersCount: number;
  nonTeachersCount: number;
}

export type PersonnelCategory = 'district' | 'district_admin_officer' | 'administration' | 'admin_officer' | 'elementary' | 'secondary' | 'non_teaching';

export interface PersonnelMember {
  id: string;
  name: string;
  position: string;
  category: PersonnelCategory;
  departmentOrGrade: string;
  reportsToId?: string | null;
  email?: string;
  contactNumber?: string;
  order: number;
  photoUrl?: string;
}

export interface AdminUser {
  username: string;
  role: 'Super Administrator' | 'School Administrator' | 'ICT Coordinator';
  displayName: string;
  email: string;
}

export interface FacilityItem {
  id: string;
  title: string;
  desc: string;
  category?: string;
  imageUrl?: string;
  iconName?: string;
  capacity?: string;
  order?: number;
}

export interface HLIFile {
  id: string;
  pillarId?: string; // which pillar this file belongs to (e.g. 'pillar-1')
  name: string; // filename e.g. "VIS_Health_Policy_2025.pdf"
  title: string; // display title e.g. "School Health Policy Directive"
  fileSize: string; // e.g. "1.2 MB"
  fileType: string; // e.g. "pdf", "docx", "xlsx", "image", "document"
  uploadedAt: string;
  downloadUrl: string; // Base64 data URI or web link
  isRestricted: boolean; // true = download locked/restricted by admin; false = allowed for download
  restrictionReason?: string;
  description?: string;
  hasChunks?: boolean;
  chunkCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HLIPillar {
  id: string;
  pillarNumber: number; // 1 to 6
  name: string; // "Pillar 1", "Pillar 2", etc.
  title: string; // e.g. "Healthy School Policy & Leadership"
  subtitle?: string;
  description: string;
  keyFocusAreas: string[];
  status?: string; // "Active", "Operational", "In Progress"
  leadCoordinator?: string;
  files: HLIFile[];
}

export interface HLISettings {
  title: string; // "Healthy Learning Institute"
  subtitle: string;
  description: string;
  pillars: HLIPillar[];
  updatedAt?: string;
}

export type InquiryStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface InquiryMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  inquiryType: string;
  message: string;
  submittedAt: string;
  status: InquiryStatus;
  targetSchoolEmail: string;
  emailStatus: 'sent' | 'pending' | 'logged';
  emailNotificationSent: boolean;
  emailNotificationLog?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

