export enum CourseTarget {
  object = 'object',
  requirement = 'requirement',
  achieved = 'achieved',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  READY = 'ready',
  REJECT = 'reject',
  DELETED = 'deleted',
  PRIVATE = 'private',
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
