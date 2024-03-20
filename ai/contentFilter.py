import pandas as pd
import numpy as np
# import plotly.graph_objects as go
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
from fetch_data import get_all_courses, get_enrolled_courses

# ============================== Flask ==============================
from flask import Flask
import json

app = Flask(__name__)
port = 5007
# ============================== Flask ==============================

logedInUserID = 1
enrolled_courses = get_enrolled_courses(logedInUserID)
print("User enrolled courseID: ", enrolled_courses)

# Content based filtering

# read courses and user tags
# courses_data = pd.read_csv("Course_Desc.csv", header=0)
courses_data = get_all_courses()

# Filter all courses to extract 
courses_extracted = [{'courseId': course['courseId'], 'courseTitle': course['courseTitle'], 'description': course['description']} for course in courses_data]

# Convert filtered data into a DataFrame
courses_df = pd.DataFrame(courses_extracted)
# print("courses_df ", courses_df)

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

# print("Similarity matrix: ")
# print(similarity_matrix)


# Clustering
# Assign num of clusters
kmeans = KMeans(n_clusters=10)
kmeans.fit(tfidf_matrix)
print("k labels", kmeans.labels_)

# Assign cluster labels to courses
courses_df['cluster'] = kmeans.labels_

# Reduce dimensions
# pca = PCA(n_components=2)
# reduced_data = pca.fit_transform(tfidf_matrix.toarray())

# # Plot each cluster
# fig = go.Figure()
# colors = ['blue', 'green', 'red', 'cyan', 'magenta', 'yellow', 'orange', 'purple', 'brown']
# for i in range(len(colors)):
#     x = reduced_data[:, 0][kmeans.labels_ == i]
#     y = reduced_data[:, 1][kmeans.labels_ == i]
#     fig.add_trace(go.Scatter(x=x, y=y, mode='markers', marker=dict(color=colors[i])))

# # fig layout
# fig.update_layout(
#     title='Clusters after PCA Reduction',
#     xaxis_title='PCA1',
#     yaxis_title='PCA2',
#     showlegend=True
# )
# fig.show()


# Function to recommend similar course
def recommend_courses_by_description(query_courseTitle, top_n=5):
    # Calculate TF-IDF vector of query description
    # Produces a weighted score for each term (want to minimize terms)
    query_vector = tfidf_vectorizer.transform([query_courseTitle])

    # Calculate cosine similarities between query and all courses
    similarities = cosine_similarity(query_vector, tfidf_matrix)

    # Sort courses by similarity score and get top N
    sorted_indices = np.argsort(similarities)[0][::-1][:top_n]

    # Return recommended courses
    return pd.concat([courses_df.iloc[sorted_indices][['courseId']],
                      courses_df.iloc[sorted_indices][['courseTitle']]], axis=1).reset_index(drop=True)


def print_term_idf(title):
    # Get the index of the course in the DataFrame
    course_index = courses_df[courses_df['courseTitle'] == title].index[0]

    # Get the TF-IDF matrix for the specific course
    course_tfidf_vector = tfidf_matrix[course_index]

    # Get the indices of non-zero elements in the TF-IDF matrix
    nonzero_indices = course_tfidf_vector.nonzero()[1]

    # Get the feature names (terms)
    feature_names = tfidf_vectorizer.get_feature_names_out()

    print("Term IDF for course '{}'".format(title))
    for index in nonzero_indices:
        term = feature_names[index]
        idf_value = tfidf_vectorizer.idf_[index]
        print("Term: {}, IDF: {}".format(term, idf_value))


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
        all_recommendations = all_recommendations.drop_duplicates().reset_index(drop=True)

    return all_recommendations

# Test the function
course_title = "Microprocessor Systems"
print_term_idf(course_title)

# Test the function
print("\n Recommend courses by description:")
print(recommend_courses_by_description(course_title))

# coen 313 = 391 = "Microprocessor Systems"
print("\n Recommend courses based on cluster:")
print(recommend_courses_by_cluster(391))

# Test the function
print("Recommend courses based on cluster:")
# Recommend similar courses for each enrolled course
# Combine them and remove duplicates
all_recommendations = get_all_recommendations()
print(all_recommendations)


# ============================== Flask ==============================
@app.get('/suggestion')
def suggestion():
    all_recommendations = get_all_recommendations()
    all_recommendations_json = all_recommendations.to_json(orient='records') 
    return all_recommendations_json

if __name__ == '__main__':
    app.run(debug=False, port=port)
# ============================== Flask ============================== 


# Accuracy = ( TruePositive + TrueNegative ) / ( P + N )
# Recall = TruePositive / ( TruePositive + FalseNegative )
# Precision = TruePositive / ( TruePositive + FalsePositive )
# F1 = ( 2 * Precision * Recall ) / ( Precision + Recall )
