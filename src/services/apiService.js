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

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  };

  const requestOptions = {
    method,
    mode: 'cors',
    headers,
    ...options
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
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
const incidentService = {
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
   * Get incident by ID
   * @param {string|number} id - The incident ID
   * @returns {Promise<object>} - The incident data
   */
  getIncidentById: async (id) => {
    try {
      const data = await apiRequest('incident/selectIncidentDetail', 'POST', { incident_id: id });

      // Transform the data if needed
      const transformedData = data ? {
        ...data,
        incident_name: bufferToString(data.incident_name, "incident_name", data),
        creator_id: bufferToString(data.creator_id, "creator_id", data),
        description: bufferToString(data.description, "description", data),
        type: bufferToString(data.type, "type", data),
        status: bufferToString(data.status, "status", data),
      } : null;

      return transformedData;
    } catch (error) {
      console.error(`Failed to fetch incident with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new incident
   * @param {object} incidentData - The incident data
   * @returns {Promise<object>} - The created incident
   */
  createIncident: async (incidentData) => {
    return apiRequest('incident/insertIncident', 'POST', incidentData);
  },

  /**
   * Update an incident
   * @param {object} incidentData - The incident data with ID
   * @returns {Promise<object>} - The updated incident
   */
  updateIncident: async (incidentData) => {
    return apiRequest('incident/updateIncident', 'POST', incidentData);
  },

  /**
   * Delete an incident
   * @param {string|number} id - The incident ID
   * @returns {Promise<object>} - The result of the deletion
   */
  deleteIncident: async (id) => {
    return apiRequest('incident/deleteIncident', 'POST', { incident_id: id });
  }
};

/**
 * Export all API services
 */
export {
  apiRequest,
  bufferToString,
  parseResponseData,
  incidentService
};

// Default export for the main API service
export default {
  incident: incidentService,
  // Add more services here as needed
  // user: userService,
  // report: reportService,
  // etc.
};
