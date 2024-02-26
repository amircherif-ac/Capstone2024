import { Course } from "./Course"
import { User } from "./User"

export type Event = {
    eventID: number,
    userID: number,
    courseID: number,
    title: string,
    eventDescription: string,
    scheduledAt: string,
    scheduleEndTime: string,
    triggeredAt: string,
    location: string,
    createdAt: string,
    updatedAt: string,
    user: User,
    course: Course
}

export type CreateEventRequest = {
    userId: number,
    courseId: number,
    title: string,
    eventDescription: string,
    scheduledAt: string,
    scheduleEndTime: string,
    triggeredAt: string,
    location: string
}

export type EditEventRequest = {
    eventId: number,
    courseId: number,
    title: string,
    eventDescription: string,
    scheduledAt?: string,
    scheduleEndTime: string,
    triggeredAt: string,
    location: string
}

export type DeleteEventRequest = {
    eventId: number,
}
