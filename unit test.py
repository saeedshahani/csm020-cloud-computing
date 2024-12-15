import unittest
import requests #venv has been excluded for size, run pip install requests

class TestEndpoints(unittest.TestCase):
    def setUp(self):
        self.base_url = 'http://localhost:3000'
        self.auth_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWY2ZmJiMDYwM2YzZGZkNWRjYjExMzEiLCJpYXQiOjE3MTE5MDA5NTZ9.Yrj_GcTNCcSHGEcZdTCPk7ndAPscwgu8SaiatP24FZ0'
        self.auth_token2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjA5OTRhMzc4NzU1YjA1OGMwYzk5MTQiLCJpYXQiOjE3MTE5MDM5MTV9.sqYhd5tNZbeY3Iv9QacV2dcURAvet_9JeFGh6MujH2A'
        self.auth_token3 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWY2ZjRjYzkyNWIyM2ViZjVhOTU1NDkiLCJpYXQiOjE3MTA2ODM3MTN9.uGTMdyQwaHsNdG3CBGRyYj_-PA-RIEpYxwQSSvlz4Ak'

    def test_register_endpoint(self):
        # Define test data
        data = {
            'username' : 'Tommy',
            'email': 'tommy@abc.com',
            'password': '1231234'
        }
        
        # Send request to register endpoint
        response = requests.post(f'{self.base_url}/api/user/register', json=data)

        # Check response status code
        self.assertEqual(response.status_code, 200)  # Assuming successful registration returns 200 status code

    def test_login_endpoint(self):
        # Define test data
        data = {
            'email': 'saeed@abc.com',
            'password': '1231234'
        }
        
        # Send request to login endpoint
        response = requests.post(f'{self.base_url}/api/user/login', json=data)

        # Check response status code
        self.assertEqual(response.status_code, 200)

    def test_post_endpoint(self):
        # Define test data
        data = {
            'postTitle': 'hello hello',
            'postDescription': 'This is a test post',
            'postOwner': '65f6f4cc925b23ebf5a95549'
        }
        
        # Send request to post endpoint with authentication token in headers
        headers = {'Authorization': f'Bearer {self.auth_token3}'}
        response = requests.post(f'{self.base_url}/api/post', json=data, headers=headers)

        # Check response status code
        self.assertEqual(response.status_code, 201)

    def test_posts_endpoint(self):
        # Send request to posts endpoint with authentication token in headers
        headers = {'Authorization': f'Bearer {self.auth_token3}'}
        response = requests.get(f'{self.base_url}/api/posts', headers=headers)

        # Check response status code
        self.assertEqual(response.status_code, 200)

    def test_get_post_endpoint(self):
        # Define test data
        data = {
            'postId': '660703055d481adc9ba549bd'
        }
        
        # Send request to get post endpoint with authentication token in headers
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        response = requests.post(f'{self.base_url}/api/post', json=data, headers=headers)

        # Check response status code
        self.assertEqual(response.status_code, 200)
    
    def test_post_like_endpoint(self):
        # Define test data
        data = {
            'postId': '660703055d481adc9ba549bd',
            'userId': '65f6fbb0603f3dfd5dcb1131',
            'likeAdd': True,  # Example: Adding like
            'likeRemove': False
        }
        
        # Send request to post/like endpoint with authentication token in headers
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        response = requests.put(f'{self.base_url}/api/post/like', json=data, headers=headers)

        # Check response status code
        self.assertEqual(response.status_code, 200)

    def test_post_comment_endpoint(self):
        # Define test data
        data = {
            'postId': '660703055d481adc9ba549bd',
            'userId': '65f6fbb0603f3dfd5dcb1131',
            'comment': 'This is a test comment'
        }
        
        # Send request to post/comment endpoint with authentication token in headers
        headers = {'Authorization': f'Bearer {self.auth_token}'}

if __name__ == '__main__':
    unittest.main()