/**
 * ============================================================================
 * EDUCATIONAL TYPESCRIPT DEMONSTRATION MODULE
 * ============================================================================
 * This file is prepared for your Web Technology practical viva evaluation!
 * It demonstrates 3 foundational TypeScript concepts used in Taskora:
 *  1. Interfaces (Contract definition)
 *  2. Classes (Object-oriented encapsulation)
 *  3. Generics (Reusable, type-safe data containers)
 */

import { Assignment, PriorityLevel, AssignmentStatus } from '../types';

/**
 * 1. INTERFACE DEMONSTRATION
 * Defines the contract that any assignment tracking entity must adhere to.
 */
export interface ITrackableEntity {
  id: string;
  createdAt: Date;
  isOverdue(): boolean;
}

/**
 * 2. CLASS DEMONSTRATION
 * Encapsulates assignment logic, validation, and deadline calculations
 * using an Object-Oriented approach.
 */
export class AssignmentManager implements ITrackableEntity {
  public id: string;
  public title: string;
  public subject: string;
  public dueDate: Date;
  public priority: PriorityLevel;
  public status: AssignmentStatus;
  public createdAt: Date;

  constructor(
    id: string,
    title: string,
    subject: string,
    dueDate: Date,
    priority: PriorityLevel = 'Medium',
    status: AssignmentStatus = 'Pending'
  ) {
    this.id = id;
    this.title = title;
    this.subject = subject;
    this.dueDate = dueDate;
    this.priority = priority;
    this.status = status;
    this.createdAt = new Date();
  }

  /**
   * Checks whether the assignment has passed its due date
   * and is not yet marked as 'Completed'.
   */
  public isOverdue(): boolean {
    if (this.status === 'Completed') return false;
    return new Date() > this.dueDate;
  }

  /**
   * Calculates the remaining days until the deadline.
   */
  public getDaysRemaining(): number {
    const diffMs = this.dueDate.getTime() - new Date().getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Factory method to construct an instance from a plain Assignment object.
   */
  public static fromPlainObject(assignment: Assignment): AssignmentManager {
    return new AssignmentManager(
      assignment._id,
      assignment.title,
      assignment.subject,
      new Date(assignment.dueDate),
      assignment.priority,
      assignment.status
    );
  }
}

/**
 * 3. GENERICS DEMONSTRATION
 * A generic API response container `ApiResponse<T>` that can wrap any
 * data type (e.g., Assignment, Subject, User, or lists thereof) safely.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * A Generic filter utility that filters any array of items of type T
 * based on a predicate function.
 */
export function filterItems<T>(items: T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}

/**
 * Example usage explaining viva concept:
 * Given a list of assignments, filter out only the completed ones using the generic function.
 */
export function getCompletedAssignments(assignments: Assignment[]): Assignment[] {
  return filterItems<Assignment>(assignments, (item) => item.status === 'Completed');
}
