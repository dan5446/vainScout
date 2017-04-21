// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCRcnAyOhlAATlkFgIg6GJQkY-atcgT_6s',
    authDomain: 'vainscout.firebaseapp.com',
    databaseURL: 'https://vainscout.firebaseio.com',
    storageBucket: 'vainscout.appspot.com',
    messagingSenderId: '794390759871'
  },
  vgApi: {
    // tslint:disable-next-line:max-line-length
    apiKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIwNGYzYTZhMC1kZDAwLTAxMzQtMTg5Yi0wMjQyYWMxMTAwMDQiLCJpc3MiOiJnYW1lbG9ja2VyIiwib3JnIjoiZGFuNTQ0Ni1nbWFpbC1jb20iLCJhcHAiOiIwNGVmZTM2MC1kZDAwLTAxMzQtMTg5YS0wMjQyYWMxMTAwMDQiLCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.fbhLFjBtA9GG7aOYo-4U1necI5axGbJCSKNcgPSjMMU'
  }
};
