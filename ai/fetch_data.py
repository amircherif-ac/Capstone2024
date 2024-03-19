import requests

# Given user id, get array of the courses id that the user is currently enrolled in
# http://localhost:5000/api/enrollment//courseStudentsAI/1
def get_enrolled_courses(user_id):
    url = f"http://localhost:5000/api/enrollment/courseStudentsAI/{user_id}"
    response = requests.get(url)
    if response.status_code == 200:
        enrolled_courses = response.json()
        return enrolled_courses
    else:
        print("Failed to fetch enrolled courses.")
        return []


# Get array of the all the courses available: collumn course_id, course_title, course_description
# http://localhost:5000/api/courses/ai 
def get_all_courses():
    url = "http://localhost:5000/api/courses/ai"
    response = requests.get(url)
    if response.status_code == 200:
        all_courses = response.json()
        return all_courses
    else:
        print("Failed to fetch all courses.")
        return []

print("=================================   Enrolled Courses    =================================")
print(get_enrolled_courses(1))

# print("=================================   All Courses    =================================")
# print(get_all_courses())