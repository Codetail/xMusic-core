import axios from "axios";

const Configuration = {
  endpoint: "http://localhost:3000/",
  endpointRemote: "http://95.46.85.1:3000/",
};


/**
 * Endpoint pre configured http connection library
 */
Configuration.http = axios.create({
  baseURL: Configuration.endpoint
});

export default Configuration;