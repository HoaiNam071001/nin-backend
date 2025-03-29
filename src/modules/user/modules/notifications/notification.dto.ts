export interface NotificationPayload {
  type: NotificationType;
  senderId?: number;
  userId: number;
  courseId?: number;
  data?: NotificationMetadata;
}

export enum NotificationStatus {
  READ = 'read',
  UNREAD = 'unread',
}

export enum NotificationType {
  COURSE_APPROVED = 'course_approved',
  COURSE_REJECTED = 'course_rejected',
  COURSE_SUBSCRIPTION = 'course_subscription',
  COURSE_REVIEWED = 'course_reviewed',
  COURSE_COMMENT = 'course_comment',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export type NotificationMetadata = {
  content?: string;
  subscriptionId?: number;
};
