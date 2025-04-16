const securityReducer = (state, action) => {
    switch (action.type) {
      case 'SET_LOADING':
        return {
          ...state,
          loading: true
        };
      case 'GET_SENSORS_SUCCESS':
        return {
          ...state,
          sensors: action.payload,
          loading: false
        };
      case 'ADD_SENSOR_SUCCESS':
        return {
          ...state,
          sensors: [...state.sensors, action.payload],
          loading: false
        };
      case 'UPDATE_SENSOR_SUCCESS':
        return {
          ...state,
          sensors: state.sensors.map(sensor => 
            sensor._id === action.payload._id ? action.payload : sensor
          ),
          loading: false
        };
      case 'DELETE_SENSOR_SUCCESS':
        return {
          ...state,
          sensors: state.sensors.filter(sensor => sensor._id !== action.payload),
          loading: false
        };
      case 'CHANGE_SYSTEM_STATE':
        return {
          ...state,
          systemStatus: action.payload,
          loading: false
        };
      case 'GET_LOGS_SUCCESS':
        return {
          ...state,
          logs: action.payload,
          loading: false
        };
      case 'ALERT_TRIGGERED':
        return {
          ...state,
          logs: [action.payload, ...state.logs],
          loading: false
        };
      case 'SECURITY_ERROR':
        return {
          ...state,
          error: action.payload,
          loading: false
        };
      case 'CLEAR_ERRORS':
        return {
          ...state,
          error: null
        };
      default:
        return state;
    }
  };
  
  export default securityReducer;