import pandas as pd
import numpy as np
# import plotly.graph_objects as go
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler
from fetch_data import get_all_courses, get_enrolled_courses

# ============================== Flask ==============================
from flask import Flask
import json

app = Flask(__name__)
port = 5007
# ============================== Flask ==============================

user_data = {
    'UserId': [1, 1, 2, 2, 1],
    'courseId': [391, 393, 507, 422, 422],
    'Total_Sessions_Attended': [10, 10, 12, 12, 9],
    'Avg_Assessment_Grade': [85, 78, 92, 88, 70],
    'Engagement_Level': [3, 2, 3, 3, 2],  # 1-3 for engagement level
    'Rating': [4.5, 3.5, 4.0, 4.0, 3.0]  # Ratings for each user
}

# Transpose the dictionary to convert keys to columns and values to rows
transposed_user_data = {k: pd.Series(v) for k, v in user_data.items()}

# Convert the transposed dictionary to a DataFrame
user_df = pd.DataFrame(transposed_user_data)

print(user_df)

logedInUserID = 1
enrolled_courses = get_enrolled_courses(logedInUserID)
print("User enrolled courseID: ", enrolled_courses)

# Collaborative filtering based filtering

# read courses and user tags
# courses_data = pd.read_csv("Course_Desc.csv", header=0)
courses_data = get_all_courses()

# Filter all courses to extract 
courses_extracted = [{'courseId': course['courseId'], 'courseTitle': course['courseTitle']} for course in courses_data]

# Convert filtered data into a DataFrame
courses_df = pd.DataFrame(courses_extracted)
print("courses_df ", courses_df)

# Filter course based on enrolled course of userId
# For testing not used
enrolled_courses_df = courses_df[courses_df['courseId'].isin(enrolled_courses)]
print("enrolled_courses_df: ", enrolled_courses_df)

# Function to calculate similarity matrix
def calculate_similarity_matrix(user_df):
    # Normalize features
    scaler = MinMaxScaler()
    numerical_features = ['Total_Sessions_Attended', 'Avg_Assessment_Grade', 'Engagement_Level', 'Rating']
    user_df[numerical_features] = scaler.fit_transform(user_df[numerical_features])
    print(user_df)

    # Calculate similarity matrix
    similarity_matrix = cosine_similarity(user_df[numerical_features])
    print("Similarity matrix: ")
    print(similarity_matrix)
    return similarity_matrix

# Function to recommend a courseId
def recommend_course(userId, user_df, enrolled_courses):
    # Calculate similarity matrix
    similarity_matrix = calculate_similarity_matrix(user_df)

    # Find the index of the current user in the similarity matrix
    user_index = user_df[user_df['UserId'] == userId].index[0]
    print(user_index)

    # Get similarity scores of the current user with all other users
    user_similarity_scores = similarity_matrix[user_index]

    # Sort the similarity scores in descending order
    sorted_similarity_indices = np.argsort(user_similarity_scores)[::-1]

    # Initialize a dictionary to count occurrences of courses
    course_count = {}

    # Iterate through similar users
    for similar_user_index in sorted_similarity_indices:
        # Skip the current user
        if similar_user_index == user_index:
            continue
        
        # Get the courseId of the similar user
        similar_user_course = user_df.loc[similar_user_index, 'courseId']
        
        # Increment the count for the courseId
        course_count[similar_user_course] = course_count.get(similar_user_course, 0) + 1

    # Sort the courseId by count in descending order
    sorted_courses = sorted(course_count.items(), key=lambda x: x[1], reverse=True)

    # Recommend the courseId that is not already enrolled by the current user
    for course_id, count in sorted_courses:
        if course_id not in enrolled_courses:
            return course_id
    return None

# test
print(recommend_course(logedInUserID, user_df, enrolled_courses))



# ============================== Flask ==============================
@app.get('/suggestion')
def suggestion():
    enrolled_courses = get_enrolled_courses(user_id)
    course_to_recommend = recommend_course(user_id, user_df, enrolled_courses)
    return course_to_recommend

if __name__ == '__main__':
    app.run(debug=False, port=port)
# ============================== Flask ============================== 

# Accuracy = ( TruePositive + TrueNegative ) / ( P + N )
# Recall = TruePositive / ( TruePositive + FalseNegative )
# Precision = TruePositive / ( TruePositive + FalsePositive )
# F1 = ( 2 * Precision * Recall ) / ( Precision + Recall )

