import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA

from fetch_data import get_all_courses, get_enrolled_courses

from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
port = 5007
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.get('/suggestion/<userid>')
def suggestion(userid):

    logedInUserID = userid
    enrolled_courses = get_enrolled_courses(logedInUserID)
    print("User enrolled courseID: ", enrolled_courses)

    # Content based filtering
    courses_data = get_all_courses()

    # Filter all courses to extract 
    courses_extracted = [{'courseId': course['courseId'], 'courseTitle': course['courseTitle'], 'description': course['description']} for course in courses_data]

    # Convert filtered data into a DataFrame
    courses_df = pd.DataFrame(courses_extracted)

    # Filter course based on enrolled course of userId
    # For testing not used
    enrolled_courses_df = courses_df[courses_df['courseId'].isin(enrolled_courses)]
    print("enrolled_courses_df: ", enrolled_courses_df)

    # Display DataFrames
    print("Courses DataFrame:")
    print(courses_df)

    # Calculate Term Frequency-Inverse Document Frequency (TF-IDF)
    tfidf_vectorizer = TfidfVectorizer()
    tfidf_matrix = tfidf_vectorizer.fit_transform(courses_df['description'])

    print("TF-IDF Matrix: ", tfidf_matrix.toarray())
    print("TF-IDF Matrix shape", tfidf_matrix.shape)
    df_idf = pd.DataFrame(tfidf_vectorizer.idf_, index=tfidf_vectorizer.get_feature_names_out(), columns=["idf_weights"])
    print("IDF", df_idf.sort_values(by=['idf_weights']))

    # Calculate similarity matrix
    similarity_matrix = cosine_similarity(tfidf_matrix)

    # Clustering
    # Assign num of clusters
    kmeans = KMeans(n_clusters=10)
    kmeans.fit(tfidf_matrix)
    print("k labels", kmeans.labels_)

    # Assign cluster labels to courses
    courses_df['cluster'] = kmeans.labels_

    # Function to recommend courses based on clusters
    def recommend_courses_by_cluster(courseId, top_n=5):
        # Find the cluster label of the given course
        course_cluster = courses_df.loc[courses_df['courseId'] == courseId, 'cluster'].values[0]

        # Filter courses from the same cluster, excluding the queried course
        similar_courses = courses_df[courses_df['cluster'] == course_cluster]
        similar_courses = similar_courses[similar_courses['courseId'] != courseId]

        # Return top N similar courses
        return similar_courses[['courseId', 'courseTitle', 'description']].head(top_n)

    def get_all_recommendations():
        all_recommendations = pd.DataFrame(columns=['courseId', 'courseTitle', 'description'])  
        for courseId in enrolled_courses:
            recommendations = recommend_courses_by_cluster(courseId)
            all_recommendations = pd.concat([all_recommendations, recommendations], ignore_index=True)  # Concatenate the recommendations
            NoDupRecommendations = all_recommendations.drop_duplicates().reset_index(drop=True)

        return NoDupRecommendations

    # Get all recommendations
    all_recommendations = get_all_recommendations()
    all_recommendations_json = all_recommendations.to_json(orient='records') 
    return all_recommendations_json

if __name__ == '__main__':
    app.run(debug=False, port=port)

#=======================================================================================================

# Accuracy = ( TruePositive + TrueNegative ) / ( P + N )
# Recall = TruePositive / ( TruePositive + FalseNegative )
# Precision = TruePositive / ( TruePositive + FalsePositive )
# F1 = ( 2 * Precision * Recall ) / ( Precision + Recall )