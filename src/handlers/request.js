const axios = require('axios');

const httpMethods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'];

const headersPass = ({ endpoint, method }) => {
  if(!endpoint || !method) {
    return false;
  }

  let isHttpMethod = httpMethods.filter((item) => item === method);

  if(isHttpMethod.length === 0) {
    return false;
  }
  
  return true;
}

const make = async ({ domain, authorization }, { method, endpoint, data }) => {

  // Set default settings for Axios.
  axios.defaults.baseURL = domain;
  axios.defaults.headers.common['Authorization'] = authorization;

  if(!headersPass({ method, endpoint })) {
    return {
      success: false,
      content: 'FAIL TO PASS HTTP TEST'
    };
  }

  if(method === 'GET') {
    try {
      const { data } = await axios.get(endpoint);
      
      return {
        success: true,
        content: data
      };
    } catch(err) {
      return {
        success: false,
        content: err.response
      };
    }
  }

  if(method === 'POST') {
    try {
      const { data } = await axios.post(endpoint, data);
      
      return {
        success: true,
        content: data
      };
    } catch(err) {
      return {
        success: false,
        content: err.response
      };
    }
  }

  return {
    success: false,
    content: 'THE METHOD IS NOT AVAILABLE IN THIS MOMENT'
  };
}

module.exports = { make };