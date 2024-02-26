export type Course = {
    courseId: number,
    courseTitle: string,
    description: string,
    subject: Subject,
    courseLevel: CourseLevel,
    program: Program,
    degree: Degree,
}

export type Subject = {
    courseNumber: string,
    courseCode: CourseCode,
}

export type CourseCode = {
    courseCode: string,
}

export type CourseLevel = {
    courseLevel: string
}

export type Program = {
    programName: string,
}

export type Degree = {
    degreeName: string,
}
