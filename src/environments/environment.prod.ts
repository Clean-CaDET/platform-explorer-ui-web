export const environment = {
  production: true,
  apiHost: '/api/', // Use relative path to go through nginx proxy
  //apiHost: 'http://localhost:5000/api/', //dockerized BE (direct - doesn't work from browser)
  //apiHost: 'http://localhost:8000/api/' //local BE
};
