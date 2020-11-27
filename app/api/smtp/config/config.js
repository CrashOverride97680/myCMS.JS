// MODULE EXPORT MAIL
const host = (process.env.NODE_ENV_HOST_SMTP) ? process.env.NODE_ENV_HOST_SMTP : null;
const port = (process.env.NODE_ENV_PORT_SMTP) ? process.env.NODE_ENV_PORT_SMTP : null; 
const secure = (process.env.NODE_ENV_SECURE_SMTP) ? process.env.NODE_ENV_SECURE_SMTP : null;
const auth = (process.env.NODE_ENV_AUTH_SMTP) ? process.env.NODE_ENV_AUTH_SMTP : null;
module.exports = {
	host, 		// @host: string for smtp host
	port, 		// @port: number port for connection
	secure, 	// @secure: true if you use port 465, false for another port
	auth        // @auth: object with mail and password user ( user: mail, pass: password mail )
};