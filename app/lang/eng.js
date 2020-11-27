// MODULE EXPORT MAIL
module.exports = {
// LABEL WEB_API
	LABEL_SERVER: 'SERVER LISTEN ON PORT:',
	LABEL_JSON_STATUS: 'SERVER STATUS WORK!!',
	LABEL_JSON_NOT_FOUND: 'MESSAGE 404 ROUTE NOT FOUND',
	LABEL_JSON_STATUS_NUMBER: 'MESSAGE SERVER STATUS 200',
	LABEL_JSON_STATUS_NUMBER_NOT_FOUND: '404',
	LABEL_ERROR_RETURN: 'ERROR',
	LABEL_LOGOUT: 'SIGNOUT SUCCESS',
	LABEL_RESEND_EMAIL: { message: 'RESEND EMAIL CHECK YOUR EMAIL BOX' },
	LABEL_LOCAL_CACHE_BLACKLIST_ON: 'LOCAL CACHE TOKEN REVOKE RUNNING',
// LABEL CHECK DATA
	LABEL_CHECK_EMAIL: 'EMAIL IS REQUIRED',
	LABEL_CHECK_PASSWORD: 'EMAIL IS REQUIRED',
// LABEL HTTP SERVER
//	1XX INFORMATIONAL
	LABEL_100_HTTP: { number: '100', message: '100 CONTINUE' },
	LABEL_101_HTTP: { number: '101', message: '101 SWITCHING PROTOCOLS' },
	LABEL_102_HTTP: { number: '102', message: '102 PROCESSING' },
//	2XX SUCCESS
	LABEL_200_HTTP: { number: '200', message: '200 OK' },
	LABEL_201_HTTP: { number: '201', message: '201 CREATED' },
	LABEL_202_HTTP: { number: '202', message: '202 ACCEPTED' },
	LABEL_203_HTTP: { number: '203', message: '203 NON-AUTHORITATIVE INFORMATION' },
	LABEL_204_HTTP: { number: '204', message: '204 NO CONTENT' },
	LABEL_205_HTTP: { number: '205', message: '205 RESET CONTENT' },
	LABEL_206_HTTP: { number: '206', message: '206 PARTIAL CONTENT' },
	LABEL_207_HTTP: { number: '207', message: '207 MULTI-STATUS' },
	LABEL_208_HTTP: { nunber: '208', message: '208 ALREADY REPORTED' },
//	3XX REDIRECTION
	LABEL_300_HTTP: { number: '300', message: '300 MULTIPLE CHOICES' },
	LABEL_301_HTTP: { number: '301', message: '301 MOVED PERMANENTLY' },
	LABEL_302_HTTP: { number: '302', message: '302 FOUND' },
	LABEL_303_HTTP: { number: '303', message: '303 SEE OTHER (da HTTP/1.1)' },
	LABEL_304_HTTP: { number: '304', message: '304 NOT MODIFIED' },
	LABEL_305_HTTP: { number: '305', message: '305 USE PROXY (da HTTP/1.1)' },
	LABEL_306_HTTP: { number: '306', message: '306 SWITCH PROXY' },
	LABEL_307_HTTP: { number: '307', message: '307 TEMPORARY REDIRECT (da HTTP/1.1)' },
	LABEL_308_HTTP: { number: '308', message: '308 PERMANENT REDIRECT (approved RFC sperimental)' },
//	4XX CLIENT ERROR
	LABEL_400_HTTP: { number: '400', message: '400 BAD REQUEST' },
	LABEL_401_HTTP: { number: '401', message: '401 UNAUTHORIZED' },
	LABEL_402_HTTP: { number: '402', message: '402 PAYMENT REQUIRED' },
	LABEL_403_HTTP: { number: '403', message: '403 FORBIDDEN' },
	LABEL_404_HTTP: { number: '404', message: '404 NOT FOUND' },
	LABEL_405_HTTP: { number: '405', message: '405 METHOD NOT ALLOWED' },
	LABEL_406_HTTP: { number: '406', message: '406 NOT ACCEPTABLE' },
	LABEL_407_HTTP: { number: '407', message: '407 PROXY AUTHENTICATION REQUIRED' },
	LABEL_408_HTTP: { number: '408', message: '408 REQUEST TIMEOUT' },
	LABEL_409_HTTP: { number: '409', message: '409 CONFLICT' },
	LABEL_410_HTTP: { number: '410', message: '410  GONE' },
	LABEL_411_HTTP: { number: '411', message: '411 LENGTH REQUIRED' },
	LABEL_412_HTTP: { number: '412', message: '412 PRECONDITION FAILED' },
	LABEL_413_HTTP: { number: '413', message: '413 REQUEST ENTITY TOO LARGE' },
	LABEL_414_HTTP: { number: '414', message: '414 REQUEST-URI TOO LONG' },
	LABEL_415_HTTP: { number: '415', message: '415 UNSUPPORTED MEDIA TYPE' },
	LABEL_416_HTTP: { number: '416', message: '416 REQUEST RANGE NOT SATISFIABLE' },
	LABEL_417_HTTP: { number: '417', message: '417 EXPECTATION FAILED' },
	LABEL_418_HTTP: { number: '418', message: '418 I\'M A TEAPOT' },
	LABEL_420_HTTP: { number: '420', message: '420 ENHANCE YOUR CALM' },
	LABEL_422_HTTP: { number: '422', message: '422 UNPROCESSABLE ENTITY' },
	LABEL_426_HTTP: { number: '426', message: '426 UPGRADE REQUIRED' },
	LABEL_429_HTTP: { number: '429', message: '429 TOO MANY REQUESTS' },
	LABEL_449_HTTP: { number: '449', message: '449 RETRY WITH' },
	LABEL_451_HTTP: { number: '451', message: '451 UNAVAILABLE FOR LEGAL REASONS' },
//	5XX SERVER ERROR
	LABEL_500_HTTP: { number: '500', message: '500 INTERNAL SERVER ERROR' },
	LABEL_501_HTTP: { number: '501', message: '501 NOT IMPLEMENTED' },
	LABEL_502_HTTP: { number: '502', message: '502 BAD GATEWAY' },
	LABEL_503_HTTP: { number: '503', message: '503 SERVICE UNAVAILABLE' },
	LABEL_504_HTTP: { number: '504', message: '504 GATEWAY TIMEOUT' },
	LABEL_505_HTTP: { number: '505', message: '505 HTTP VERSION NOT SUPPORTED' },
	LABEL_509_HTTP: { number: '509', message: '509 BANDWIDTH LIMIT EXCEEDED' },
// LABEL SMTP
	LABEL_ERROR_SMTP: { resp: 'GENERAL ERROR SENDING MAIL, EMAIL REJECTED' },
	LABEL_ACCEPTED_SMTP: { resp: 'MAIL SENDING' },
// LABEL MONGOOSE
	LABEL_CONNECT_MONGOOSE: 'MONGOOSE DEFAULT CONNECTION IS OPEN TO:',
	LABEL_CONNECTED_MONGOOSE_FUNCTION: 'CONNECTED',
	LABEL_OCCURRED_MONGOOSE: 'MONGOOSE DEFAULT CONNECTION HAS OCCURED:',
	LABEL_ERROR_FUNCTION_NAME: 'ERROR',
	LABEL_DEFAULT_ERROR: 'MONGOOSE DEFAULT CONNECTION IS DISCONNECTED',
	LABEL_DISCONNECTED_FUNCTION_NAME: 'DISCONNECTED',
	LABEL_DISCONNECTED_APPLICATION_TERM: 'MONGOOSE DEFAULT CONNECTION IS DISCONNECTED DUE TO APPLICATION TERMINATION',
	LABEL_SIGURS_ONE_MONGOOSE: 'MONGOOSE DISCONNECTED THROUGH APP TERMINATION (SIGTERM)',
	LABEL_SIGINT_FUNCTION_MOONGOOSE: 'SIGINT',
	LABEL_SIGTERM_FUNCTION: 'SIGTERM',
	LABEL_DISCONNECTED_APP: 'MONGOOSE DISCONNECTED THROUGH APP TERMINATION (SIGUSR2)',
	LABEL_SIGUSR_TWO_FUNCTION_MONGOOSE: 'SIGUSR2',
	LABEL_ERROR_MONGOOSE: 'ERROR REQUEST MONGOOSE:',
// LABEL DEBUG
	LABEL_ENV_VAR: 'ENV_VAR:',
	LABELL_ACCESS_PAGE: { message: 'YOU HAVE ACCESS TO SECRET PAGE' },
	LABEL_DECODE_TOKEN_TEST: 'DECODE VARIABLE TEST',
	LABEL_TOKEN_HEADER: 'TOKEN HEADER',
	LABEL_UPLOADFILE_CHECK: 'UPLOADS ARRAY FILE',
	LABEL_UPLOAD_VARIABLE: 'REQUEST WITH FILE DATA:',
	LABEL_TEST_UPLOAD: 'FILE OR FILES UPLOADED INFO:',
	LABEL_RESULT_UPLOAD_OK: 'FILE OR FILES UPLOADED',
	LABEL_RESULT_UPLOAD_ERROR: 'FILE OR FILES NOT UPLOADED ERROR:',
	LANG_DEBUG_USER: 'USER:',
	LANG_DEBUG_TOKEN: 'TOKEN:',
	LANG_DEBUG_ERROR: 'ERROR:',
	LANG_DEBUG_DATA: 'DATA:',
	LANG_DEBUG_RESULT: 'RESULT:',
	LANG_DEBUG_HASH: 'HASH:',
	LANG_DEBUG_PASSWORD: 'PASSWORD:',
	LANG_DEBUG_HEADER: 'HEADER', 
	LANG_DEBUG_MULTIPLE_DATA_COLLECTION: 'MULTIPLE DATA INTO COLLECTION:',
	LANG_DEBUG_EMAIL_HOST: 'INSERT INTO .ENV FILE HOST INFORMATION',
	LANG_DEBUG_EMAIL_PORT: 'INSERT INTO .ENV FILE PORT INFORMATION',
	LANG_DEBUG_EMAIL_SECURE: 'INSERT INTO .ENV FILE SECURE INFORMATION',
	LANG_DEBUG_EMAIL_AUTH: 'INSERT INTO .ENV FILE AUTH INFORMATION',
	LANG_DEBUG_EMAIL_USER: 'INSERT INTO .ENV FILE USER INFORMATION',
	LANG_DEBUG_EMAIL_PASSWORD: 'INSERT INTO .ENV FILE PASSWORD INFORMATION',
	LANG_DEBUG_EMAIL_SERVICE: 'INSERT INTO .ENV FILE SERVICE INFORMATION',
	LANG_DEBUG_EMAIL_DEBUG: 'INSERT INTO .ENV FILE DEBUG INFORMATION',
	LANG_DEBUG_EMAIL_LOGGER: 'INSERT INTO .ENV FILE LOGGER INFORMATION',
	LANG_DEBUG_EMAIL_REJECT_UNAUTHORIZED: 'INSERT INTO .ENV FILE REJECT UNAUTHORIZED INFORMATION',
// LABEL TEST SMTP
	LANG_TEST_SMTP_SUBJECT: 'Test Email',
// LABEL SCHEDULER
	LABEL_SCHEDULER_RUN: 'SCHEDULER IS UPPER RUNNING',
// LABEL MULTER
	LABEL_MULTER_VALIDATION_ERROR: 'ONLY IMAGE, FILES, VIDEO ARE ALLOWED!',
	LABEL_MULTER_ERROR: 'ONLY IMAGE FILES ARE ALLOWED!',
	LABEL_UPLOAD_STATUS_COMPLETE: { status: 200, message: 'UPLOAD COMPLETE' },
// LANG TEST FOR MOCHA
// LANG REDIS CACHE
	LABEL_REDIS_CONNECTION_ERROR: 'PROBLEM CONNECTION REDIS CHECK PARAMETRES',
	LABEL_REDIS_ERROR_SAVE: 'SAVE DATA INTO REDIS',
	LABEL_REDIS_CATCH_REDIS: 'PROBLEM GENERAL REDIS:',
	LABEL_REDIS_CONNECTED: 'CONNECTED TO SERVER REDIS',
	LABEL_REDIS_CONNECTED_TEST: 'CONNECTED TO SERVER REDIS TEST',
	LABEL_END_REDIS_CONNECTION: 'END REDIS CONNECTION',
	LABEL_END_REDIS_CONNECTION_TEST: 'END REDIS CONNECTION TEST',
};