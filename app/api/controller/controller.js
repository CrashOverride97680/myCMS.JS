// IMPORT MODULES NODEJS
const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');
// PASSWORD LIBRARY IMPORTING
const generator = require('secure-random-password');
// IMPORTING LOCAL CACHING BLACKLIST
const blkLocal = process.env.NODE_ENV_LOCAL_BLACKLIST
	? require('../autentication/blacklist-local/blacklist-local')
	: null;
// IMPORT MONGO DB ( MONGOSCHEMA )
const mongoose = require('mongoose');
// IMPORT SMTP ( IMPORTING SMTP)
const smtp = require('../smtp/smtp');
// IMPORTING LANG AND DEBUG
const langServer = '../../lang/' + (process.env.LANG_SERVER || 'eng');
const lang = require(langServer);
// IMPORT ENV DATA OR DEBUG
const secret = process.env.SECRET_KEY || 'secret_key';
const bcrypt = require('bcryptjs');
const testUser = process.env.NODE_ENV_DEV
	? {
			id: Math.floor(Math.random() * (999999999 - 99999999 + 1) + 99999999),
			admin: true,
			email: 'email@test.xd',
			password: 'testUser',
			username: 'TestUser',
			surname: 'TestUser',
			confirmed: true
		}
	: null;
const testUserMail = process.env.NODE_ENV_DEV
	? {
			from: 'test@test.test',
			to: 'test@test.test',
			email: 'email@test.xd',
			subject: 'test',
      username: 'testUsername'
		}
	: null;
//  REDIS CACHING MODULE
const redis = !process.env.NODE_ENV_LOCAL_BLACKLIST
	? require('redis')
	: null;
const redisConfig = !process.env.NODE_ENV_LOCAL_BLACKLIST
	? require('../cache/config/config')
	: null;
//  IMPORTING CACHING WHITELIST FOR REGENERATE TOKEN
const whtlstlocal = !process.env.NODE_ENV_LOCAL_WHITELIST
	? require('../autentication/whitelist-local/whitelist-local')
  : null;
//  IMPORTING GENERAL FUNCTIONS
const genFunctions = require('../general');
//  EXPORTING MODULE
module.exports =
{
/*
-------------------------------------------------------------------------

        CONTROLLER TEST THIS PART OF CODE CONTENT ALL TEST
        FOR TESTING CMS

-------------------------------------------------------------------------
*/
// FATTO
  test: (req, resp) => {
    resp
      .json({
        resp: lang.LABEL_JSON_STATUS_NUMBER,
        server: lang.LABEL_JSON_STATUS
      });
  },
// FATTO
  adminCreateForTesting: (req, resp) => {
    try 
    {
      const user = {
        email: req.body.email,
        username: req.body.username,
        name: req.body.name,
        surname: req.body.surname,
        token: req.headers['authorization']
      };
      const passwords = generator.randomPassword({
        length: process.env.NODE_ENV_PASSWORD_ADMIN_LENGTH ? process.env.NODE_ENV_PASSWORD_ADMIN_LENGTH : 10,
        characters:[generator.lower, generator.upper, generator.digits],
      });

      if(process.env.NODE_ENV_TEST)
      {
        user.password = passwords;
        console.log(lang.LANG_DEBUG_DATA, user);
      }

      bcrypt
        .hash(passwords, 10, (err, hash) => 
        {
          if (!err)
          {
            if(process.env.NODE_ENV_TEST)
            {
              console.log(lang.LANG_DEBUG_HASH, hash);
              console.log(lang.LANG_DEBUG_PASSWORD, passwords);
            }

            const findUser = mongoose.model('user', 'users');
            findUser.find(
            {
              email: user.email
            }, (err, data) => 
            {
              if(process.env.NODE_ENV_DEV) {
                console.log(lang.LANG_DEBUG_DATA, data);
                console.log(lang.LANG_DEBUG_ERROR, err);
              }
              if (data.length > 2) 
              {
                console.log(lang.LANG_DEBUG_MULTIPLE_DATA_COLLECTION, data);
                resp
                  .status(500)
                  .json(lang.LABEL_500_HTTP);
              }
              else if (data.length > 0) 
              {
                if (data[0].confirmed === false)
                  resp
                    .status(202)
                    .json(lang.LABEL_RESEND_EMAIL);
                else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              }
              else 
              {
                const createUser = mongoose.model('user', 'users');
                let dateObj = new Date();
                createUser.create(
                {
                  admin: user.admin,
                  email: user.email,
                  password: hash,
                  username: user.username,
                  name: user.name,
                  surname: user.surname,
                  admin: true,
                  create: dateObj.toISOString()
                }, (err, result) => 
                {
                  if (err === null)
                    resp
                      .status(201)
                      .json(lang.LABEL_201_HTTP);
                });
              }
            });
          }
          else
            resp
              .status(500)
              .json(lang.LABEL_500_HTTP);
        });
    }
    catch (e) {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  testMail: (req, resp) => {
    smtp
      .testMail()
      .then(data => {
        let SMTPConfig = smtp.createTransport({
          host: data.smtp.host,
          port: data.smtp.port,
          secure: data.smtp.secure,
          auth: {
            user: data.user,
            pass: data.pass
          }
        });
        smtp
          .send({
            SMTPConfig,
            from: testUserMail.from,
            to: testUserMail.to,
            subject: testUserMail.subject,
            html: smtp.template.register({ username: testUserMail })
          })
          .then((rejection) => {
            if (rejection.accepted)
              resp
                .status(200)
                .json(lang.LABEL_ACCEPTED_SMTP);
            else
            resp
              .status(500)
              .json(lang.LABEL_ERROR_SMTP);
          })
          .catch(() => resp.status(500).json(lang.LABEL_500_HTTP));
      })
      .catch(() => resp.status(500).json(lang.LABEL_500_HTTP));
  },
// FATTO
  secretTest: (req, resp) => resp.json(lang.LABELL_ACCESS_PAGE),
// FATTO
  checkTokenTest: (req, resp) => {
    const token = req.headers['authorization'];
    console.log("AUTHORIZATION:", token);
    jwt
      .verify(token, secret, (err, decoded) =>
      {
        if(!err)
          resp
            .status(200)
            .json({
              info: lang.LABEL_DECODE_TOKEN_TEST,
              message: decoded
            });
        else
        {
          console.log(lang.LABEL_ERROR_RETURN, err);
          resp
            .status(403)
            .json(lang.LABEL_403_HTTP);
        }
      });
  },
// FATTO
  sendTestToken: (req, resp) => {
    const id = generator.randomPassword({
      length: 25,
      characters:[generator.lower, generator.upper, generator.digits],
    });
    jwt
      .sign({ _id: id, username: "loremIpsumAdmin", admin: true, auth: true }, secret, { expiresIn: '1d' }, (err, token) =>
      {
        if (err)
        {
          console.log(lang.LABEL_ERROR_RETURN, err);
          resp
            .status(500)
            .json(lang.LABEL_500_HTTP);
        }
        else
        {
          resp
            .json({
              token
            });
        }
      });
  },
// FATTO
  uploadTest: (req, resp) => {
    try
    {
      console.log(lang.LABEL_TEST_UPLOAD, req.file);
      console.log(lang.LABEL_RESULT_UPLOAD_OK);
        resp.status(200).json(lang.LABEL_200_HTTP);
    }
    catch(err)
    {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },

/*
-------------------------------------------------------------------------

        CONTROLLER ALLERT THIS PART OF CODE CONTENT ALL METHOD
        FOR EMERGENCY RESTORE WEBSITE

-------------------------------------------------------------------------
*/
// FATTO
  adminCreateForAllert: (req, resp) => {
    try 
    {
      const user = {
        email: req.body.email,
        username: req.body.username,
        name: req.body.name,
        surname: req.body.surname,
        token: req.headers['authorization']
      };
      const passwords = generator.randomPassword({
        length: process.env.NODE_ENV_PASSWORD_ADMIN_LENGTH ? process.env.NODE_ENV_PASSWORD_ADMIN_LENGTH : 10,
        characters:[generator.lower, generator.upper, generator.digits],
      });

      if(process.env.NODE_ENV_TEST)
      {
        user.password = passwords;
        console.log(lang.LANG_DEBUG_DATA, user);
      }

      bcrypt
        .hash(passwords, 10, (err, hash) => 
        {
          if (!err)
          {
            if(process.env.NODE_ENV_TEST)
            {
              console.log(lang.LANG_DEBUG_HASH, hash);
              console.log(lang.LANG_DEBUG_PASSWORD, passwords);
            }

            const findUser = mongoose.model('user', 'users');
            findUser.find(
            {
              email: user.email
            }, (err, data) => 
            {
              if(process.env.NODE_ENV_DEV) {
                console.log(lang.LANG_DEBUG_DATA, data);
                console.log(lang.LANG_DEBUG_ERROR, err);
              }
              if (data.length > 2) 
              {
                console.log(lang.LANG_DEBUG_MULTIPLE_DATA_COLLECTION, data);
                resp
                  .status(500)
                  .json(lang.LABEL_500_HTTP);
              }
              else if (data.length > 0) 
              {
                if (data[0].confirmed === false)
                  resp
                    .status(202)
                    .json(lang.LABEL_RESEND_EMAIL);
                else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              }
              else 
              {
                const createUser = mongoose.model('user', 'users');
                let dateObj = new Date();
                createUser.create(
                {
                  admin: user.admin,
                  email: user.email,
                  password: hash,
                  username: user.username,
                  name: user.name,
                  surname: user.surname,
                  admin: true,
                  create: dateObj.toISOString()
                }, (err, result) => 
                {
                  if (err === null)
                    resp
                      .status(201)
                      .json(lang.LABEL_201_HTTP);
                });
              }
            });
          }
          else
            resp
              .status(500)
              .json(lang.LABEL_500_HTTP);
        });
    }
    catch (e) {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },

/*
-------------------------------------------------------------------------

        CONTROLLER USERS EX: LOGIN/LOGOUT
        CREATE/MODIFY/DELETE USER 

-------------------------------------------------------------------------
*/        
// FATTO
  login: (req, resp) => {
    try
    {
      const user = {
        email: req.body.email,
        password: req.body.password,
      };

      if (user.email === testUser.email && user.password === testUser.password)
      {
        if (process.env.NODE_ENV_DEV)
        {
          const {
            id,
            username,
            admin
          } = testUser;
          jwt
            .sign({ _id: id, username, admin, auth: true }, secret, { expiresIn: '1d' }, (err, token) =>
            {
              if (err)
              {
                console.log(lang.LABEL_ERROR_RETURN, err);
                resp
                  .status(500)
                  .json(lang.LABEL_500_HTTP);
              }
              else
              {
                resp
                  .json({
                    token
                  });
              }
            });
        }
        else
          resp
            .status(403)
            .json(lang.LABEL_403_HTTP);
      }
      else
      {
        try
        {
          const mongoUser = mongoose.model('user', 'users');
          const { email, password } = user;
          mongoUser
            .findOne({
              email,
              confirmed: true
            }, (err, result) => {
              if(process.env.NODE_ENV_DEV)
                console.log(lang.LANG_DEBUG_RESULT, result);
              if(err === null)
              {
                if(result !== null)
                {
                  const data = result;
                  if(process.env.NODE_ENV_DEV){
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, data);
                  }
                  bcrypt
                    .compare(password, data.password, (err, result) =>
                    {
                      if(result)
                      {
                        const { _id, username, admin } = data;
                        jwt
                          .sign({ _id, username, admin, auth: true }, secret, { expiresIn: '1d' }, (err, token) =>
                          {
                            if (err)
                            {
                              console.log(lang.LABEL_ERROR_RETURN, err);
                              resp
                                .status(500)
                                .json(lang.LABEL_500_HTTP);
                            }
                            else
                            {
                              resp
                                .json({
                                  token
                                });
                            }
                          });
                      }
                      else
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                    });
                }
                else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              }
              else
                resp
                  .status(403)
                  .json(lang.LABEL_403_HTTP);
            });
        }
        catch(err)
        {
          console.log(lang.LABEL_ERROR_RETURN, err);
          resp
            .status(403)
            .json(lang.LABEL_403_HTTP);
        }
      }
    }
    catch (err)
    {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
	logout: (req, resp) => {
		try
		{
			const token = req.headers['authorization'];
			if(blkLocal !== null)
			{
				jwt
					.verify(token, secret, (err, decoded) =>
					{
						const { _id, username } = decoded;
						const tokenBlacklist = blkLocal
													.findCache_LOCAL({
														name:'tokens',
														data:{
															token
														}
													});
						if(!tokenBlacklist)
						{
							blkLocal
								.insert_LOCAL({
									name:'tokens',
									data:{
										_id,
										username,
										token
									}
								});
							resp
								.status(200)
								.json(lang.LABEL_200_HTTP);
						}
						else
							resp
								.status(403)
								.json(lang.LABEL_403_HTTP);
					});
			}
			else if (blkLocal === null)
			{
				jwt
					.verify(token, secret, (err, decoded) =>
					{
						const { _id, username } = decoded;
						const client = redisConfig.clientRedis();
						const tokenBlacklist = client
													.get(token, (err, reply) =>
													{
														if(!reply){
															const data = new Date();
															const value = JSON
																			.stringify(
																			{
																				_id,
																				username,
																				time: data.toISOString()
																			});
															client.set(token, value, redis.print);
															resp
																.status(200)
																.json(lang.LABEL_200_HTTP);
														}
														else
															resp
																.status(403)
																.json(lang.LABEL_403_HTTP);
													});

					});
			}
		}
		catch (err)
		{
			console.log(lang.LABEL_ERROR_RETURN, err);
			resp
				.status(500)
				.json(lang.LABEL_500_HTTP);
		}
  },
// FATTO
  requireSignin: () => expressJWT({ secret }),  
// FATTO
  register: (req, resp) => {
    try {
      const user =
      {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        name: req.body.name,
        surname: req.body.surname
      };

      if (process.env.NODE_ENV_DEV)
        console.log(lang.LANG_DEBUG_USER, user);

      if (!user.token)
      {
        const findUser = mongoose.model('user', 'users');
        try
        {
          findUser
            .findOne({email: user.email}, (error, data) =>
            {
              if(process.env.NODE_ENV_TEST){
                console.log(lang.LANG_DEBUG_ERROR, error);
                console.log(lang.LANG_DEBUG_DATA, data);
              }
              if (error === null)
              {
                if (data !== null)
                {
                  if (data.confirmed === false)
                    resp
                      .status(202)
                      .json(lang.LABEL_RESEND_EMAIL);
                  else
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                }
                else
                {
                  bcrypt
                    .hash(user.password, 10, (err, hash) =>
                    {
                      if (!err)
                      {
                        const createUser = mongoose.model('user', 'users');
                        let dateObj = new Date();
                        createUser.create({
                          email: user.email,
                          password: hash,
                          username: user.username,
                          name: user.name,
                          surname: user.surname,
                          create: dateObj.toISOString()
                        },
                        (err, result) =>
                        {
                          if (err == null)
                            resp
                              .status(201)
                              .json(lang.LABEL_201_HTTP);
                        });
                      }
                    });
                }
              }
              else
                resp
                  .status(403)
                  .json(lang.LABEL_403_HTTP);
            });
        }
        catch (e)
        {
          console.log(lang.LABEL_ERROR_RETURN, e);
          resp
            .status(500)
            .json(lang.LABEL_500_HTTP);
        }
      }
      else
        resp
          .status(403)
          .json(lang.LABEL_403_HTTP);
    }
    catch (e)
    {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  registerAdmin: (req, resp) => {
    try {
      const user = {
        email: req.body.email,
        username: req.body.username,
        name: req.body.name,
        surname: req.body.surname,
        token: req.headers['authorization']
      };

      Promise.all([
        genFunctions.isValidToken({
          token: user.token,
          localBlacklist: blkLocal,
          redisBlacklist: redis
        }),
        genFunctions.checkTypeUser({
          token: user.token
        })
      ])
      .then(result => {
        const res = result[1];
        const { admin } = res;
        if(admin)
        {
          const passwords = generator.randomPassword({
            length: process.env.NODE_ENV_PASSWORD_ADMIN_LENGTH ? process.env.NODE_ENV_PASSWORD_ADMIN_LENGTH : 10,
            characters:[generator.lower, generator.upper, generator.digits],
          });

          if(process.env.NODE_ENV_TEST)
          {
            user.password = passwords;
            console.log(lang.LANG_DEBUG_DATA, user);
          }

          bcrypt
            .hash(passwords, 10, (err, hash) => 
            {
              if (!err)
              {
                if(process.env.NODE_ENV_TEST)
                {
                  console.log(lang.LANG_DEBUG_HASH, hash);
                  console.log(lang.LANG_DEBUG_PASSWORD, passwords);
                }

                const findUser = mongoose.model('user', 'users');
                findUser.find(
                {
                  email: user.email
                }, (err, data) => 
                {
                  if(process.env.NODE_ENV_DEV) {
                    console.log(lang.LANG_DEBUG_DATA, data);
                    console.log(lang.LANG_DEBUG_ERROR, err);
                  }
                  if (data.length > 2) 
                  {
                    console.log(lang.LANG_DEBUG_MULTIPLE_DATA_COLLECTION, data);
                    resp
                      .status(500)
                      .json(lang.LABEL_500_HTTP);
                  }
                  else if (data.length > 0) 
                  {
                    if (data[0].confirmed === false)
                      resp
                        .status(202)
                        .json(lang.LABEL_RESEND_EMAIL);
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else 
                  {
                    const createUser = mongoose.model('user', 'users');
                    let dateObj = new Date();
                    createUser.create(
                    {
                      admin: user.admin,
                      email: user.email,
                      password: hash,
                      username: user.username,
                      name: user.name,
                      surname: user.surname,
                      admin: true,
                      create: dateObj.toISOString()
                    }, (err, result) => 
                    {
                      if (err === null)
                        resp
                          .status(201)
                          .json(lang.LABEL_201_HTTP);
                    });
                  }
                });
              }
              else
                resp
                  .status(500)
                  .json(lang.LABEL_500_HTTP);
            });
        }
        else
          resp
            .json(lang.LABEL_403_HTTP);
      })
      .catch(err => {
        console.log(lang.LANG_DEBUG_ERROR, err);
        resp
          .status(err.status)
          .json(err.lang);
      });
    }
    catch (e) {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  checkAdminUser: (req, resp, next) => {
    try
    {
      const token = req.headers['authorization'];
      if (typeof token !== 'undefined')
      {
        client
          .get(token, (err, reply) =>
          {
            if(reply)
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
            else
            {
              jwt
                .verify(auth, secret, (err, decode) =>
                {
                  if (err)
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  else
                  {
                    if(decode.admin)
                      next();
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);

                  }
                });
            }
          });
      }
      else
        resp
          .status(403)
          .json(lang.LABEL_403_HTTP);
    }
    catch(err)
    {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  chechUserAuth: (req, resp, next) => {
    try
    {
      const token = req.headers['authorization'];
      const client = redisConfig.clientRedis();
      if (typeof token !== 'undefined')
      {
        client
          .get(token, (err, reply) =>
          {
            if(reply)
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
            else
            {
              jwt
                .verify(token, secret, (err, decode) =>
                {
                  if (err)
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  else
                    next();
                });
            }
          });
      }
      else
        resp
          .status(403)
          .json(lang.LABEL_403_HTTP);
    }
    catch(err)
    {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  modifyUser: (req, resp) => {
    const user =
      {
        email: req.body.email,
        username: req.body.username,
        name: req.body.name,
        surname: req.body.surname,
        token: req.headers['authorization']
      };

      if (process.env.NODE_ENV_DEV)
        console.log(lang.LANG_DEBUG_USER, user);

      jwt
        .verify(user.token, secret, (error, decode) =>
        {
          if(error == null)
          {
            const findUser = mongoose.model('user', 'users');
            const {
              _id,
              username
            } = decode;
            findUser.findById(_id, (error, data) =>
            {
              if(error == null)
              {
                if(data.confirmed)
                {
                  if(user.email && user.username && user.name && user.surname)
                  {
                    const newUser =
                    {
                      email: req.body.email,
                      username: req.body.username,
                      name: req.body.name,
                      surname: req.body.surname,
                    }

                    const modifyUser = mongoose.model('user', 'users');
                    modifyUser.findByIdAndUpdate(_id, newUser, (err, result) =>
                    {
                      if(err === null)
                        resp
                          .status(200)
                          .json(lang.LABEL_200_HTTP);
                      else
                        resp
                          .status(500)
                          .json(lang.LABEL_500_HTTP);
                    });
                  }
                  else
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                }
                else
                  resp
                    .status(500)
                    .json(lang.LABEL_500_HTTP);
              }
              else
                resp
                  .status(500)
                  .json(lang.LABEL_500_HTTP);
            });
          }
          else
            resp
              .status(500)
              .json(lang.LABEL_500_HTTP);
        });
  },
// FATTO
  resetPassword: (req, resp) => {
    const user =
    {
      token: req.headers['authorization'],
      newPassword: req.body.newPassword
    };

    jwt
      .verify(token, secret, (error, decode) =>
      {
        const updateUser = mongoose.model('user', 'users');
        const {
          _id
        } = decode;
        updateUser.findByIdAndUpdate(_id,
        {

        }, (error, data) =>
        {
          if(error == null)
            resp
              .status(200)
              .json(lang.LABEL_200_HTTP);
          else
            resp
              .status(500)
              .json(lang.LABEL_500_HTTP);
        });
      });
  },
// FATTO
  deleteUser: (req, resp) => {
    try
    {
      const token = req.headers['authorization'];
      if (process.env.NODE_ENV_DEV)
        console.log(lang.LANG_DEBUG_TOKEN, token);
      jwt
        .verify(token, secret, (err, decoded) =>
        {
          if(!err)
          {
            const {
              _id
            } = decoded;
            const removeUser = mongoose.model('user', 'users');
            removeUser
              .findOneAndDelete({
                _id,
                confirmed:true
              }, (err, data) =>
              {
                if(data !== null)
                  resp
                    .status(200)
                    .json(lang.LABEL_200_HTTP);
                else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });
          }
          else
          {
            console.log(lang.LABEL_ERROR_RETURN, err);
            resp
              .status(403)
              .json(lang.LABEL_403_HTTP);
          }
        });
    }
    catch (e)
    {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },

/*
-------------------------------------------------------------------------

        CONTROLLER FOR MANAGEMENT PAGES
        OF CMS

-------------------------------------------------------------------------
*/  
// FATTO 
  createCategorySite: (req, resp) => {
    try {
      const token = req.headers['authorization'];
      const category = {
        name: req.body.name,
        description: req.body.description,
        titleSeo: req.body.titleSeo,
        important: (req.body.important >= 0) ? req.body.important : null,
        visible: req.body.visible  
      };
      
      Promise.all([
        genFunctions.isValidToken({
          token,
          localBlacklist: blkLocal,
          redisBlacklist: redis
        }),
        genFunctions.checkTypeUser({
          token
        })
      ])
      .then(result => {
        const res = result[1];
        const { admin } = res;
        if(admin)
        {
          const findCollection = mongoose.model('category', 'category');
          const find = findCollection.find(
          {
            name: category.name
          }, (err, result) => {
            if(result.length > 0)
              resp
                .status(409)
                .json(lang.LABEL_409_HTTP);
            else {
              const createCategory = mongoose.model('category', 'category');
              let dateObj = new Date();
              createCategory.create({
                name: category.name,
                description: category.description,
                titleSEO: category.titleSeo,
                important: category.important,
                visible: category.visible,
                create: dateObj.toISOString()
              }, (err, result) => 
              {
                if (err === null)
                  resp
                    .status(201)
                    .json(lang.LABEL_201_HTTP);
                else
                  resp
                    .status(500)
                    .json(lang.LABEL_500_HTTP);
              });
            }
          });
        }
        else
          resp
            .json(lang.LABEL_403_HTTP);
      })
      .catch(err => {
        console.log(lang.LANG_DEBUG_ERROR, err);
        resp
          .status(err.status)
          .json(err.lang);
      });
    }
    catch (e) {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },   
// FATTO
  createSubCategorySite: (req, resp) => {
    try {
      const token = req.headers['authorization'];
      const subCategory = {
        codCategoryPrincipal: req.body.codCategory,
        name: req.body.name,
        description: req.body.description,
        titleSeo: req.body.titleSeo,
        important: (req.body.important >= 0) ? req.body.important : null,
        visible: req.body.visible  
      };
      
      Promise.all([
        genFunctions.isValidToken({
          token,
          localBlacklist: blkLocal,
          redisBlacklist: redis
        }),
        genFunctions.checkTypeUser({
          token
        })
      ])
      .then(result => {
        const res = result[1];
        const { admin } = res;
        if(admin)
        {
          const findCollection = mongoose.model('category', 'category');
          const find = findCollection.find(
          {
            subCategory: subCategory.name
          }, (err, result) => {
            if(result.length > 0)
              resp
                .status(409)
                .json(lang.LABEL_409_HTTP);
            else {
              const createSubCategory = mongoose.model('category', 'category');
              let dateObj = new Date();
              createSubCategory.findOneAndUpdate(
                {
                  _id: subCategory.codCategoryPrincipal
                }
                {
                  $set: 
                  {
                    subCategory: 
                    {
                      name: subCategory.name,
                      description: subCategory.description,
                      titleSeo: subCategory.titleSEO,
                      important: subCategory.important,
                      visible: subCategory.visible  
                    }
                  }
                }, (err, result) => 
              {
                if (err === null)
                  resp
                    .status(201)
                    .json(lang.LABEL_201_HTTP);
                else
                  resp
                    .status(500)
                    .json(lang.LABEL_500_HTTP);
              });
            }
          });
        }
        else
          resp
            .json(lang.LABEL_403_HTTP);
      })
      .catch(err => {
        console.log(lang.LANG_DEBUG_ERROR, err);
        resp
          .status(err.status)
          .json(err.lang);
      });
    }
    catch (e) {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// DA FARE
	createPost: (req, resp) => {
		try
		{
		  const token = req.headers['authorization'];
		  if(blkLocal !== null)
		  {
			  jwt
			    .verify(token, secret, (err, decoded) =>
			    {
				    const { _id, username } = decoded;
				    const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                    name:'tokens',
                    data:{
                      token
                    }
                });
                if(!tokenBlacklist)
                {
                  jwt
                    .verify(token, secret, (err, decoded) =>
                    {
                      if(process.env.NODE_ENV_TEST)
                      {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if(err === null)
                      {
                        const {
                          admin
                        } = decoded;
                        if(admin)
                        {
                          const posts = mongoose.model('posts', 'posts');
                          const date = new Date();
                          const langPost = req.body.lang;
                          const {
                            type,
                            title,
                            header,
                            content,
                            category,
                            visible
                          } = req.body;
                          let today = new Date();
                          let dd = today.getDate();
                          let mm = today.getMonth() + 1; //January is 0!

                          let yyyy = today.getFullYear();
                          
                          if (dd < 10) {
                            dd = '0' + dd;
                          }
                          
                          if (mm < 10) {
                            mm = '0' + mm;
                          }
                          
                          let thisDay = dd + '/' + mm + '/' + yyyy;
                          posts
                            .create({
                              lang: langPost,
                              type,
                              title,
                              header,
                              content,
                              category,
                              visible,
                              create: today,
                              dateUser: thisDay
                            }, (err, result) =>
                            {
                              if (err == null)
                              resp
                                .status(201)
                                .json(lang.LABEL_201_HTTP);
                            });
                        }
                        else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      }
                      else
                      {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                }
                else resp.status(403).json(lang.LABEL_403_HTTP);
          });
		  }
		  else if (blkLocal === null)
		  {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) =>
              {
                if(!reply)
                {
                  jwt
                  .verify(token, secret, (err, decoded) =>
                  {
                    if(process.env.NODE_ENV_TEST)
                    {
                      console.log(lang.LANG_DEBUG_ERROR, err);
                      console.log(lang.LANG_DEBUG_DATA, decoded);
                    }

                    if(err == null)
                    {
                      const {
                        admin
                      } = decoded;
                      if(admin) 
                      {
                        const posts = mongoose.model('posts', 'posts');
                        const date = new Date();
                        const langPost = req.body.lang;
                        const {
                          type,
                          title,
                          header,
                          content,
                          category,
                          visible
                        } = req.body;
                        let today = new Date();
                        let dd = today.getDate();
                        let mm = today.getMonth() + 1; //January is 0!

                        let yyyy = today.getFullYear();
                        if (dd < 10) {
                          dd = '0' + dd;
                        }
                        if (mm < 10) {
                          mm = '0' + mm;
                        }
                        let thisDay = dd + '/' + mm + '/' + yyyy;
                        posts
                          .create(
                          {
                            lang: langPost,
                            type,
                            title,
                            header,
                            content,
                            category,
                            visible,
                            create: today,
                            dateUser: thisDay
                          }, (err, result) =>
                          {
                            if (err == null)
                              resp
                                .status(201)
                                .json(lang.LABEL_201_HTTP);
                          });
                      }
                      else
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                    }
                    else
                    {
                      console.log(lang.LABEL_ERROR_RETURN, err);
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                    }
                  });
                }
                else
                  resp
                  .status(403)
                  .json(lang.LABEL_403_HTTP);
              });
          });
        }
    }
		catch (err)
		{
		  console.log(lang.LABEL_ERROR_RETURN, err);
		  resp
			.status(500)
			.json(lang.LABEL_500_HTTP);
		}
	},
// FATTO
	getUser: (req, resp) => {
		const token = req.headers['authorization'];
		jwt
			.verify(token, secret, (error, decode) =>
			{
				if(error)
					resp
						.status(403)
						.json(lang.LABEL_403_HTTP);
				else
				{
					const findUser = mongoose.model('user', 'users');
					findUser.findById(_id, (error, data) =>
					{
						if(error == null)
						{
							const {
								admin,
								confirmed
							} = data;

							if(admin && confirmed)
							{
								resp
								.status(200)
								.json(
								{
									email: data.email,
									username: data.username,
									name: data.name,
									surname: data.surname,
								});
							}
							else if(confirmed)
							{
								resp
								.status(200)
								.json(
								{
									email: data.email,
									username: data.username,
									name: data.name,
									surname: data.surname,
								});
							}
							else
								resp
									.status(500)
									.json(lang.LABEL_500_HTTP);
						}
						else
							resp
								.status(500)
								.json(lang.LABEL_500_HTTP);
					});
				}
			});
	},
// FATTO
  getPostsNumbers: (req, resp) => {
    try
    {
      const token = req.headers['authorization'];
      if(blkLocal !== null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                name:'tokens',
                data:{
                  token
                }
              });
            if(!tokenBlacklist)
            {
              jwt
                .verify(token, secret, (err, decoded) =>
                {
                  if(process.env.NODE_ENV_TEST)
                  {
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, decoded);
                  }

                  if(err === null)
                  {
                    const {
                      admin
                    } = decoded;
                    if(admin)
                    {
                      const posts = mongoose.model('posts', 'posts');
                      posts
                        .count({}, (err, count) => {
                          if(!err)
                            resp
                              .status(200)
                              .json({count});
                        });
                    }
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else
                  {
                    console.log(lang.LABEL_ERROR_RETURN, err);
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  }
                });
            }
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
      }
      else if (blkLocal === null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) =>
              {
                if(!reply)
                {
                  jwt
                    .verify(token, secret, (err, decoded) =>
                    {
                      if(process.env.NODE_ENV_TEST)
                      {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if(err === null)
                      {
                        const {
                          admin
                        } = decoded;
                        if(admin)
                        {
                          const posts = mongoose.model('posts', 'posts');
                          posts
                            .count({}, (err, count) => {
                              if(!err)
                                resp
                                  .status(200)
                                  .json({count});
                            });
                        }
                        else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      }
                      else
                      {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                }
                else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });

          });
      }
    }
    catch (err)
    {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  } ,
// FATTO
  getMailSubNumbers: (req, resp) => {
    try
    {
      const token = req.headers['authorization'];
      if(blkLocal !== null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                name:'tokens',
                data:{
                  token
                }
              });
            if(!tokenBlacklist)
            {
              jwt
                .verify(token, secret, (err, decoded) =>
                {
                  if(process.env.NODE_ENV_TEST)
                  {
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, decoded);
                  }

                  if(err === null)
                  {
                    const {
                      admin
                    } = decoded;
                    if(admin)
                    {
                      const mailSub = mongoose.model('mailsubscribe', 'mailsubscribe');
                      mailSub
                        .count({}, (err, count) => {
                          if(!err)
                            resp
                              .status(200)
                              .json({count});
                        });
                    }
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else
                  {
                    console.log(lang.LABEL_ERROR_RETURN, err);
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  }
                });
            }
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
      }
      else if (blkLocal === null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) =>
              {
                if(!reply)
                {
                  jwt
                    .verify(token, secret, (err, decoded) =>
                    {
                      if(process.env.NODE_ENV_TEST)
                      {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if(err === null)
                      {
                        const {
                          admin
                        } = decoded;
                        if(admin)
                        {
                          const mailSub = mongoose.model('mailsubscribe', 'mailsubscribe');
                          mailSub
                            .count({}, (err, count) => {
                              if(!err)
                                resp
                                  .status(200)
                                  .json({count});
                            });
                        }
                        else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      }
                      else
                      {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                }
                else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });

          });
      }
    }
    catch (err)
    {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  getChatsUsersNumbers: (req, resp) => {
    try
    {
      const token = req.headers['authorization'];
      if(blkLocal !== null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                name:'tokens',
                data:{
                  token
                }
              });
            if(!tokenBlacklist)
            {
              jwt
                .verify(token, secret, (err, decoded) =>
                {
                  if(process.env.NODE_ENV_TEST)
                  {
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, decoded);
                  }

                  if(err === null)
                  {
                    const {
                      admin
                    } = decoded;
                    if(admin)
                    {
                      const mailSub = mongoose.model('chat', 'chat');
                      mailSub
                        .count({}, (err, count) => {
                          if(!err)
                            resp
                              .status(200)
                              .json({count});
                        });
                    }
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else
                  {
                    console.log(lang.LABEL_ERROR_RETURN, err);
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  }
                });
            }
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
      }
      else if (blkLocal === null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) =>
              {
                if(!reply)
                {
                  jwt
                    .verify(token, secret, (err, decoded) =>
                    {
                      if(process.env.NODE_ENV_TEST)
                      {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if(err === null)
                      {
                        const {
                          admin
                        } = decoded;
                        if(admin)
                        {
                          const mailSub = mongoose.model('chat', 'chat');
                          mailSub
                            .count({}, (err, count) => {
                              if(!err)
                                resp
                                  .status(200)
                                  .json({count});
                            });
                        }
                        else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      }
                      else
                      {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                }
                else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });

          });
      }
    }
    catch (err)
    {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  getEarningNumber: (req, resp) => {
    try
    {
      const token = req.headers['authorization'];
      if(blkLocal !== null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                name:'tokens',
                data:{
                  token
                }
              });
            if(!tokenBlacklist)
            {
              jwt
                .verify(token, secret, (err, decoded) =>
                {
                  if(process.env.NODE_ENV_TEST)
                  {
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, decoded);
                  }

                  if(err === null)
                  {
                    const {
                      admin
                    } = decoded;
                    if(admin)
                    {
                      const earning = mongoose.model('earning', 'earning');
                      earning
                        .count({}, (err, count) => {
                          if(!err)
                            resp
                              .status(200)
                              .json({count});
                        });
                    }
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else
                  {
                    console.log(lang.LABEL_ERROR_RETURN, err);
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  }
                });
            }
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
      }
      else if (blkLocal === null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) =>
              {
                if(!reply)
                {
                  jwt
                    .verify(token, secret, (err, decoded) =>
                    {
                      if(process.env.NODE_ENV_TEST)
                      {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if(err === null)
                      {
                        const {
                          admin
                        } = decoded;
                        if(admin)
                        {
                          const earning = mongoose.model('earning', 'earning');
                          earning
                            .count({}, (err, count) => {
                              if(!err)
                                resp
                                  .status(200)
                                  .json({count});
                            });
                        }
                        else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      }
                      else
                      {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                }
                else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });

          });
      }
    }
    catch (err)
    {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
	getPostsWithFilter: (req, resp) => {
	  try {
      const max = ( req.params.max ) ? parseInt(req.params.max) : null;
      const token = req.headers['authorization'];
      if(blkLocal !== null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                name:'tokens',
                data:{
                  token
                }
              });
            if(!tokenBlacklist)
            {
              jwt
                .verify(token, secret, (err, decoded) =>
                {
                  if(process.env.NODE_ENV_TEST)
                  {
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, decoded);
                  }

                  if(err === null)
                  {
                    const {
                      admin
                    } = decoded;
                    if(admin)
                    {
                      if ( max !== null && max > 0 ) {
                        const posts = mongoose.model('posts', 'posts');
                        posts
                          .find({})
                          .limit(max)
                          .sort({dateUser: 'desc'})
                          .exec((err, posts) =>
                          {
                            if (!err)
                              resp
                                .status(200)
                                .json(posts);
                          });
                      }
                    }
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else
                  {
                    console.log(lang.LABEL_ERROR_RETURN, err);
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  }
                });
            }
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
      }
      else if (blkLocal === null) {
        jwt
          .verify(token, secret, (err, decoded) => {
            const {_id, username} = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) => {
                if (!reply) {
                  jwt
                    .verify(token, secret, (err, decoded) => {
                      if (process.env.NODE_ENV_TEST) {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if (err === null) {
                        const {
                          admin
                        } = decoded;
                        if (admin) {
                          if ( max !== null && max > 0 ) {
                            const posts = mongoose.model('posts', 'posts');
                            posts
                              .find({})
                              .limit(max)
                              .sort({dateUser: 'desc'})
                              .exec((err, posts) =>
                              {
                                if (!err)
                                  resp
                                    .status(200)
                                    .json(posts);
                              });
                          }
                        } else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      } else {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                } else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });

          });
      }
    }
    catch (err) {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
	getAllPosts: (req, resp) => {
    try {
      const token = req.headers['authorization'];
      if(blkLocal !== null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                name:'tokens',
                data:{
                  token
                }
              });
            if(!tokenBlacklist)
            {
              jwt
                .verify(token, secret, (err, decoded) =>
                {
                  if(process.env.NODE_ENV_TEST)
                  {
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, decoded);
                  }

                  if(err === null)
                  {
                    const {
                      admin
                    } = decoded;
                    if(admin)
                    {
                      const posts = mongoose.model('posts', 'posts');
                      posts
                        .find({})
                        .exec((err, posts) =>
                        {
                          if (!err)
                            resp
                              .status(200)
                              .json(posts);
                        });
                    }
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else
                  {
                    console.log(lang.LABEL_ERROR_RETURN, err);
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  }
                });
            }
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
      }
      else if (blkLocal === null) {
        jwt
          .verify(token, secret, (err, decoded) => {
            const {_id, username} = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) => {
                if (!reply) {
                  jwt
                    .verify(token, secret, (err, decoded) => {
                      if (process.env.NODE_ENV_TEST) {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if (err === null) {
                        const {
                          admin
                        } = decoded;
                        if (admin) {
                          const posts = mongoose.model('posts', 'posts');
                          posts
                            .find({})
                            .exec((err, posts) =>
                            {
                              if (!err)
                                resp
                                  .status(200)
                                  .json(posts);
                            });
                        } else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      } else {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                } else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });

          });
      }
    }
    catch (err) {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
	getVisiblePostNumber: (req, resp) => {
    try {
      const token = req.headers['authorization'];
      if(blkLocal !== null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                name:'tokens',
                data:{
                  token
                }
              });
            if(!tokenBlacklist)
            {
              jwt
                .verify(token, secret, (err, decoded) =>
                {
                  if(process.env.NODE_ENV_TEST)
                  {
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, decoded);
                  }

                  if(err === null)
                  {
                    const {
                      admin
                    } = decoded;
                    if(admin)
                    {
                      const posts = mongoose.model('earning', 'earning');
                      posts
                        .count({visible: true}, (err, count) => {
                          if(!err)
                            resp
                              .status(200)
                              .json({count});
                        });
                    }
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else
                  {
                    console.log(lang.LABEL_ERROR_RETURN, err);
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  }
                });
            }
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
      }
      else if (blkLocal === null) {
        jwt
          .verify(token, secret, (err, decoded) => {
            const {_id, username} = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) => {
                if (!reply) {
                  jwt
                    .verify(token, secret, (err, decoded) => {
                      if (process.env.NODE_ENV_TEST) {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if (err === null) {
                        const {
                          admin
                        } = decoded;
                        if (admin) {
                          const posts = mongoose.model('earning', 'earning');
                          posts
                            .count({visible: true}, (err, count) => {
                              if(!err)
                                resp
                                  .status(200)
                                  .json({count});
                            });
                        } else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      } else {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                } else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });

          });
      }
    }
    catch (err) {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
	getUnvisiblePostNumber: (req, resp) => {
    try {
      const token = req.headers['authorization'];
      if(blkLocal !== null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                name:'tokens',
                data:{
                  token
                }
              });
            if(!tokenBlacklist)
            {
              jwt
                .verify(token, secret, (err, decoded) =>
                {
                  if(process.env.NODE_ENV_TEST)
                  {
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, decoded);
                  }

                  if(err === null)
                  {
                    const {
                      admin
                    } = decoded;
                    if(admin)
                    {
                      const posts = mongoose.model('earning', 'earning');
                      posts
                        .count({visible: false}, (err, count) => {
                          if(!err)
                            resp
                              .status(200)
                              .json({count});
                        });
                    }
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else
                  {
                    console.log(lang.LABEL_ERROR_RETURN, err);
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  }
                });
            }
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
      }
      else if (blkLocal === null) {
        jwt
          .verify(token, secret, (err, decoded) => {
            const {_id, username} = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) => {
                if (!reply) {
                  jwt
                    .verify(token, secret, (err, decoded) => {
                      if (process.env.NODE_ENV_TEST) {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if (err === null) {
                        const {
                          admin
                        } = decoded;
                        if (admin) {
                          const posts = mongoose.model('earning', 'earning');
                          posts
                            .count({visible: false}, (err, count) => {
                              if(!err)
                                resp
                                  .status(200)
                                  .json({count});
                            });
                        } else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      } else {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                } else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });

          });
      }
    }
    catch (err) {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  getAllPostsTable: (req, resp) => {
    try {
      const token = req.headers['authorization'];
      if(blkLocal !== null)
      {
        jwt
          .verify(token, secret, (err, decoded) =>
          {
            const { _id, username } = decoded;
            const tokenBlacklist = blkLocal
              .findCache_LOCAL({
                name:'tokens',
                data:{
                  token
                }
              });
            if(!tokenBlacklist)
            {
              jwt
                .verify(token, secret, (err, decoded) =>
                {
                  if(process.env.NODE_ENV_TEST)
                  {
                    console.log(lang.LANG_DEBUG_ERROR, err);
                    console.log(lang.LANG_DEBUG_DATA, decoded);
                  }

                  if(err === null)
                  {
                    const {
                      admin
                    } = decoded;
                    if(admin)
                    {
                      const posts = mongoose.model('posts', 'posts');
                      posts
                        .find({})
                        .select('type title visible dateUser -_id')
                        .sort({dateUser: 'desc'})
                        .exec((err, posts) =>
                        {
                          if (!err)
                            resp
                              .status(200)
                              .json(posts);
                        });
                    }
                    else
                      resp
                        .status(403)
                        .json(lang.LABEL_403_HTTP);
                  }
                  else
                  {
                    console.log(lang.LABEL_ERROR_RETURN, err);
                    resp
                      .status(403)
                      .json(lang.LABEL_403_HTTP);
                  }
                });
            }
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
      }
      else if (blkLocal === null) {
        jwt
          .verify(token, secret, (err, decoded) => {
            const {_id, username} = decoded;
            const client = redisConfig.clientRedis();
            const tokenBlacklist = client
              .get(token, (err, reply) => {
                if (!reply) {
                  jwt
                    .verify(token, secret, (err, decoded) => {
                      if (process.env.NODE_ENV_TEST) {
                        console.log(lang.LANG_DEBUG_ERROR, err);
                        console.log(lang.LANG_DEBUG_DATA, decoded);
                      }

                      if (err === null) {
                        const {
                          admin
                        } = decoded;
                        if (admin) {
                          const posts = mongoose.model('posts', 'posts');
                          posts
                            .find({})
                            .select('type title visible dateUser -_id')
                            .sort({dateUser: 'desc'})
                            .exec((err, posts) =>
                            {
                              if (!err)
                                resp
                                  .status(200)
                                  .json(posts);
                            });
                        } else
                          resp
                            .status(403)
                            .json(lang.LABEL_403_HTTP);
                      } else {
                        console.log(lang.LABEL_ERROR_RETURN, err);
                        resp
                          .status(403)
                          .json(lang.LABEL_403_HTTP);
                      }
                    });
                } else
                  resp
                    .status(403)
                    .json(lang.LABEL_403_HTTP);
              });

          });
      }
    }
    catch (err) {
      console.log(lang.LABEL_ERROR_RETURN, err);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  getAllHeaderAndCategory: (req, resp) => {
    try {
      const token = req.headers['authorization'];
      Promise.all([
        genFunctions.isValidToken({
          token,
          localBlacklist: blkLocal,
          redisBlacklist: redis
        }),
        genFunctions.checkTypeUser({
          token
        })
      ])
      .then(result => {
        const res = result[1];
        const { admin } = res;
        if(admin)
        {
          const findCategory = mongoose.model('category', 'category');
          findCategory
            .find({})
            .select('_id name description titleSEO important visible subCategory updated')
            .sort({dateUser: 'desc'})
            .exec((err, category) =>
            {
              if (!err)
                resp
                  .status(200)
                  .json(category);
            });
        }
        else
          resp
            .json(lang.LABEL_403_HTTP);
      })
      .catch(err => {
        console.log(lang.LANG_DEBUG_ERROR, err);
        resp
          .status(err.status)
          .json(err.lang);
      });
    }
    catch (e) {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  modifyCategory: (req, resp) => {
    try {
      const token = req.headers['authorization'];
      const category = 
      {
        codCategory: req.body.codCategory,
        name: req.body.name,
        description: req.body.description,
        titleSeo: req.body.titleSeo,
        important: (req.body.important >= 0) ? req.body.important : null,
        visible: req.body.visible  
      };
      
      Promise.all([
        genFunctions.isValidToken({
          token,
          localBlacklist: blkLocal,
          redisBlacklist: redis
        }),
        genFunctions.checkTypeUser({
          token
        })
      ])
      .then(result => {
        const res = result[1];
        const { admin } = res;
        if(admin)
        {
          const modifyCategory = mongoose.model('category', 'category');
          modifyCategory.findByIdAndUpdate(
            {
              _id: category.codCategory 
            },
            {
              $set: 
              {
                name: category.name,
                description: category.description,
                titleSEO: category.titleSeo,
                important: category.important,
                visible: category.visible
              }
            }
          );
        }
        else
          resp
            .json(lang.LABEL_403_HTTP);
      })
      .catch(err => {
        console.log(lang.LANG_DEBUG_ERROR, err);
        resp
          .status(err.status)
          .json(err.lang);
      });
    }
    catch (e) {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
// FATTO
  deleteCategory: (req, resp) => {
    try {
      const token = req.headers['authorization'];
      const _id = req.body.codCategory;
      
      Promise.all([
        genFunctions.isValidToken({
          token,
          localBlacklist: blkLocal,
          redisBlacklist: redis
        }),
        genFunctions.checkTypeUser({
          token
        })
      ])
      .then(result => {
        const res = result[1];
        const { admin } = res;
        if(admin)
        {
          const deleteCategory = mongoose.model('category', 'category');
          deleteCategory.findByIdAndRemove(
          {
            _id
          }, (err, data) => 
          {
            if(data !== null)
              resp
                .status(200)
                .json(lang.LABEL_200_HTTP);
            else
              resp
                .status(403)
                .json(lang.LABEL_403_HTTP);
          });
        }
        else
          resp
            .json(lang.LABEL_403_HTTP);
      })
      .catch(err => {
        console.log(lang.LANG_DEBUG_ERROR, err);
        resp
          .status(err.status)
          .json(err.lang);
      });
    }
    catch (e) {
      console.log(lang.LABEL_ERROR_RETURN, e);
      resp
        .status(500)
        .json(lang.LABEL_500_HTTP);
    }
  },
/*
-------------------------------------------------------------------------

        CONTROLLER FOR GENERAL ERROR O ALLERT

-------------------------------------------------------------------------
*/
// FATTO
  notFound: (req, resp) => {
    resp
      .status(404)
      .json({
        resp: lang.LABEL_JSON_STATUS_NUMBER_NOT_FOUND,
        server: lang.LABEL_JSON_NOT_FOUND
      });
  },
};