/**
 * API Service - Handles all API requests for the application
 *
 * This service provides a reusable way to make API calls to the backend server.
 * It includes error handling, response parsing, and data transformation.
 */

// Base URL for API requests from environment variables
// If the environment variable is not set, fallback to a default value
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + '/admin/api/';

/**
 * Helper function to convert Buffer data to string
 * @param {any} value - The value to convert
 * @param {string} fieldName - The name of the field being converted
 * @param {object} originalObject - The original object containing the field
 * @returns {string} - The converted string value
 */
const bufferToString = (value, fieldName, originalObject) => {
  if (!value) return '';

  if (typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
    try {
      return String.fromCharCode.apply(null, value.data);
    } catch (error) {
      console.error(`Error converting ${fieldName} to string:`, error);
      return `[Buffer conversion error: ${fieldName}]`;
    }
  }

  return value.toString();
};

/**
 * Parse the response data
 * @param {object} data - The response data to parse
 * @returns {object} - The parsed data
 */
const parseResponseData = (data) => {
  // Handle case where the response body is a string (e.g., from Cloud Function)
  const parsedData = typeof data.body === "string" ? JSON.parse(data.body) : data;
  console.log("✅ [LOG] JSON 파싱 후 데이터:", parsedData);
  return parsedData;
};

/**
 * Make an API request
 * @param {string} endpoint - The API endpoint to call
 * @param {string} method - The HTTP method to use (GET, POST, PUT, DELETE)
 * @param {object} body - The request body
 * @param {object} options - Additional fetch options
 * @returns {Promise<object>} - The response data
 */
const apiRequest = async (endpoint, method = 'GET', body = null, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get authentication data from localStorage
  const user = localStorage.getItem('user');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  };
  
  // Add authentication header if user is authenticated
  if (isAuthenticated && user) {
    const userData = JSON.parse(user);
    // You can add authentication headers here if needed
    // For example: headers['Authorization'] = `Bearer ${userData.token}`;
  }

  const requestOptions = {
    method,
    mode: 'cors',
    headers,
    credentials: 'include', // Include cookies in the request
    ...options
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      // If unauthorized (401), clear authentication and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        // Don't redirect here, let the component handle it
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
};

/**
 * Incident API Service
 */
const apiService = {

  /**
   * Get all incidents
   * @param {object} params - Query parameters
   * @returns {Promise<Array>} - List of incidents
   */
  getAllIncidents: async (params = {}) => {
    try {
      const data = await apiRequest('incident/selectIncidentList', 'POST', params);

      // If the data needs transformation, do it here
      const transformedData = Array.isArray(data) ? data.map(incident => ({
        ...incident,
      })) : [];

      return transformedData;
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      throw error;
    }
  },

  /**
   *
   * @param params
   * @returns {Promise<void>}
   */
  getMediaList: async (params = {}) => {
    try {
      const data = await apiRequest('media/getMediaList', 'POST', params);

      return data;
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      throw error;
    }
  }

};


/**
 * User API Service
 */
const userService = {
  /**
   * Login user
   * @param {object} credentials - User credentials (userId, password)
   * @returns {Promise<object>} - User data
   */
  login: async (credentials) => {
    try {
      const data = await apiRequest('user/login', 'POST', credentials);
      
      // Store user data in localStorage for persistence
      if (data && data.userId) {
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('isAuthenticated', 'true');
        // Store login timestamp
        localStorage.setItem('loginTime', Date.now().toString());
      }
      
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    // Redirect to login page
    window.location.href = '/login';
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated: () => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const user = localStorage.getItem('user');
    
    // Check if both authentication flag and user data exist
    if (isAuth && user) {
      // Optional: Check session expiration
      const loginTime = localStorage.getItem('loginTime');
      if (loginTime) {
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const currentTime = Date.now();
        const sessionExpired = currentTime - parseInt(loginTime) > sessionDuration;
        
        if (sessionExpired) {
          // Clear expired session
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('loginTime');
          return false;
        }
      }
      return true;
    }
    return false;
  },
  
  /**
   * Get current user data
   * @returns {object|null} - User data or null if not authenticated
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get all users
   * @returns {Promise<Array>} - List of users
   */
  getAllUsers: async () => {
    try {
      const data = await apiRequest('user/getAllUsers', 'POST');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {object} userData - User data
   * @returns {Promise<object>} - Created user data
   */
  createUser: async (userData) => {
    try {
      return await apiRequest('user/registerUser', 'POST', userData);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  /**
   * Update an existing user
   * @param {object} userData - User data with userId
   * @returns {Promise<object>} - Updated user data
   */
  updateUser: async (userData) => {
    try {
      return await apiRequest('user/updateUser', 'POST', userData);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param {object} params - Parameters with userId
   * @returns {Promise<object>} - Result of deletion
   */
  deleteUser: async (params) => {
    try {
      return await apiRequest('user/deleteUser', 'POST', params);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }
};

/**
 * Export all API services
 */
export {
  apiRequest,
  bufferToString,
  parseResponseData,
  apiService,
  userService
};

// Default export for the main API service
export default {
  api: apiService,
  user: userService,
  // Add more services here as needed
  // report: reportService,
  // etc.
};
