import requests
from bs4 import BeautifulSoup

url = 'https://www.concordia.ca/academics/undergraduate/calendar/current/section-31-faculty-of-arts-and-science/section-31-200-department-of-mathematics-and-statistics/mathematics-and-statistics-courses.html#2592'
response = requests.get(url)
html_content = response.text

soup = BeautifulSoup(html_content, 'html.parser')

# Find all course sections
course_sections = soup.find_all('div', class_='accordion-item border-dark')

# Initialize an empty list to store course information objects
course_info_list = []

# Iterate over each course section
for course_section in course_sections:
    # Extract title
    title_element = course_section.find('div', class_='title')
    title = title_element.text.strip()

    # Extract prerequisite if available
    prerequisite_tag = course_section.find('h4', text='Prerequisite/Corequisite:')
    prerequisite = prerequisite_tag.find_next('a').text.strip() if prerequisite_tag else None  

    # Find the description tag within the current course section
    description_tag = course_section.find('h4', text='Description:')

    # Extract the description text if available
    if description_tag:
        description = description_tag.find_next_sibling('p')
        if description:
            description_text = description.text.strip()
        else:
            description_text = "Description not available"
    else:
        description_text = "Description not available"

    # Create the course information object and add it to the list
    course_info = {
        'title': title,
        'prerequisite': prerequisite,
        # 'description': description_text
    }
    course_info_list.append(course_info)

# Print the list of course information objects
for course_info in course_info_list:
    print(course_info)
