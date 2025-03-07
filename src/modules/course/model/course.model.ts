export enum CourseTarget {
  object = 'object',
  requirement = 'requirement',
  achieved = 'achieved',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  READY = 'ready',
  CLOSED = 'closed',
  DELETED = 'deleted',
}

export enum CourseAccessType {
  VIEW = 'view',
  EDIT = 'edit',
}

export enum InstructorType {
  PRIMARY = 'primary',
  CO_INSTRUCTOR = 'co-instructor',
  ASSISTANT = 'assistant',
  CONTENT_CREATOR = 'content_creator',
}
