import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA

from fetch_data import get_enrolled_courses

from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
port = 5007
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

def get_all_courses():
    try:
        courses = pd.read_csv("Courses.csv", header=0)
        print("Courses DataFrame:\n", courses)
        return courses
    except FileNotFoundError:
        print("Error: File not found.")
        return None
    except Exception as e:
        print("Error:", e)
        return None
    
def preprocess_data(courses_data):
    courses_df = pd.DataFrame(courses_data,
                              columns=['courseId', 'courseCode', 'courseNumber', 'courseTitle', 'description'])
    print("Preprocessed Courses DataFrame:\n", courses_df)
    return courses_df

# Function to calculate TF-IDF similarity
def calculate_tfidf_similarity(courses_df):
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf_vectorizer.fit_transform(courses_df['description'].values.astype('U'))  # Convert to Unicode
    similarity_matrix = cosine_similarity(tfidf_matrix)
    print("Similarity Matrix:\n", similarity_matrix)
    return similarity_matrix, tfidf_vectorizer

# Function to cluster courses
def cluster_courses(courses_df, similarity_matrix):
    kmeans = KMeans(n_clusters=91)
    kmeans.fit(similarity_matrix)
    courses_df['cluster'] = kmeans.labels_
    print("Cluster Labels:\n", kmeans.labels_)
    return courses_df

# Function to recommend courses based on clusters


def recommended_courses_by_cosine_similarity(enrolled_courses, all_courses, tfidf_vectorizer, top_n=5):
    user_course_descriptions = all_courses[all_courses['courseId'].isin(enrolled_courses)]['description']
    user_tfidf_matrix = tfidf_vectorizer.transform(user_course_descriptions.values.astype('U'))
    all_tfidf_matrix = tfidf_vectorizer.transform(all_courses['description'].values.astype('U'))

    cosine_similarities = cosine_similarity(user_tfidf_matrix, all_tfidf_matrix)

    recommended_courses = []
    for i, course_id in enumerate(enrolled_courses):
        # Sort courses based on cosine similarities
        similar_course_indices = cosine_similarities[i].argsort()[:-top_n - 1:-1]
        similar_courses = all_courses.iloc[similar_course_indices]
        recommended_courses.append(similar_courses[['courseId', 'courseTitle', 'courseCode', 'description']])

    recommended_courses = pd.concat(recommended_courses, ignore_index=True)
    recommended_courses = recommended_courses.drop_duplicates().reset_index(drop=True)

    print("All Recommendations no cluster:")
    for index, row in recommended_courses.iterrows():
        print("Course ID:", row['courseId'])
        print("CourseCode", row['courseCode'])
        print("Title:", row['courseTitle'])
    return recommended_courses

def count_course_codes():
    try:
        courses = pd.read_csv("Courses.csv", header=0)
        unique_course_codes = courses['courseCode'].nunique()
        print("Number of different course codes available:", unique_course_codes)
    except FileNotFoundError:
        print("Error: File not found.")
    except Exception as e:
        print("Error:", e)


def count_course_codes_rec(courses_df):
    course_code_counts = courses_df['courseCode'].value_counts()
    print("Number of different course codes available:", len(course_code_counts))
    print("Course codes and their occurrences:")
    for code, count in course_code_counts.items():
        print(f"{code}: {count} occurrences")

# Function to recommend courses within the same cluster and based on cosine similarity
def recommend_courses_within_cluster(enrolled_courses, courses_df, tfidf_vectorizer, top_n=5):
    recommended_courses = pd.DataFrame(columns=['courseId', 'courseTitle', 'courseCode', 'description'])

    for courseId in enrolled_courses:
        # Get the cluster label of the enrolled course
        cluster_label = courses_df.loc[courses_df['courseId'] == courseId, 'cluster'].values[0]

        # Filter courses within the same cluster
        cluster_courses = courses_df[courses_df['cluster'] == cluster_label]

        # Exclude the enrolled course from recommendations
        cluster_courses = cluster_courses[cluster_courses['courseId'] != courseId]

        # Calculate cosine similarity between enrolled course and cluster courses
        similarities = cosine_similarity(
            tfidf_vectorizer.transform([courses_df.loc[courses_df['courseId'] == courseId, 'description'].values[0]]),
            tfidf_vectorizer.transform(cluster_courses['description'].values.astype('U'))
        )[0]

        # Get top similar courses
        top_similar_indices = similarities.argsort()[:-top_n - 1:-1]
        top_similar_courses = cluster_courses.iloc[top_similar_indices]

        # Add recommended courses to the DataFrame
        recommended_courses = pd.concat(
            [recommended_courses, top_similar_courses[['courseId', 'courseTitle', 'description']]])

    recommended_courses = recommended_courses.drop_duplicates().reset_index(drop=True)

    print("Recommended Courses within Clusters and based on Cosine Similarity:")
    for index, row in recommended_courses.iterrows():
        print("Course ID:", row['courseId'])
        # print("Course Code:", row['courseCode'])
        print("Title:", row['courseTitle'])

    return recommended_courses



@app.get('/suggestion/<userid>')
def suggestion(userid):

    print("test")
    logedInUserID = userid
    enrolled_courses = get_enrolled_courses(logedInUserID)
    print("User enrolled courseID: ", enrolled_courses)

    # Content based filtering
    courses_data = get_all_courses()

    # Filter all courses to extract into a DataFrame
    courses_df = preprocess_data(courses_data)

    # Filter course based on enrolled course of userId
    # For testing not used
    enrolled_courses_df = courses_df[courses_df['courseId'].isin(enrolled_courses)]
    print("enrolled_courses_df: ", enrolled_courses_df)

    # Display DataFrames
    print("Courses DataFrame:")
    print(courses_df)

    # Calculate Term Frequency-Inverse Document Frequency (TF-IDF)
    # Calculate similarity matrix
    similarity_matrix, tfidf_vectorizer = calculate_tfidf_similarity(courses_df)
    courses_df = cluster_courses(courses_df, similarity_matrix)

    rec_df = recommend_courses_within_cluster(enrolled_courses, courses_df, tfidf_vectorizer)

    # Get all recommendations
    all_recommendations_json = rec_df.to_json(orient='records') 
    return all_recommendations_json

if __name__ == '__main__':
    app.run(debug=False, port=port)

#=======================================================================================================