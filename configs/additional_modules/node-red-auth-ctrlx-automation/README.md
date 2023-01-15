# Node-RED Authentication Plugin for CtrlX

This package is an authentication plugin for Node-RED that can be used to authenticate and authorize users for the CtrlX automation platform.

## Installation

To install this package, you can use npm:

`npm install node-red-auth-ctrlx-automation`

## Usage

This package exports an object with several functions that handle different aspects of the authentication process:

- `users(username)`: This function takes a username as an input and returns a promise that resolves with the user object if the username is valid. The user object must contain properties `username` and `permissions`. If the username is not valid, the promise resolves with `null`.

- `tokens(token)`: This function takes a token as an input and returns a promise that resolves with the user object if the token is valid. If the token is not valid, the promise resolves with `null`.

- `authenticate(username, password)`: This function takes a username and password as inputs and returns a promise that resolves with the user object if the credentials are valid. If the credentials are not valid, the promise resolves with `null`.

- `default()`: This function returns a promise that resolves with the user object for the default user. If no default user exists, the promise resolves with `null`.

## CtrlX license check

This package also includes a license check functionality, it checks whether the provided license is valid or not. If the license is invalid, it will try to acquire a new license. In case of failure to acquire a new license, it will return a message indicating that there is no or expired license in place and the user should contact their Rexroth representative.

## Dependencies

This package requires the following dependencies:

- `https`: A library for making HTTP requests
  
- `jwt-decode`: A library for decoding JSON Web Tokens
  

## License

See [License](./LICENSE)