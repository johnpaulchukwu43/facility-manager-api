const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    database:process.env.DATABASE_URL,
    authDatabase:process.env.AUTH_DATABASE_NAME,
    port: process.env.PORT,
    clientAppUrl:process.env.CLIENT_APP_URL,
    secretKey: process.env.SECRET_KEY,
    paystackKey:process.env.PAYSTACK_KEY,
    elasticSearchUrl:process.env.ELASTIC_SEARCH_URL,
    databaseUsername:process.env.DATABASE_USERNAME,
    databasePassword:process.env.DATABASE_PASSWORD,
    nodeEnv:process.env.NODE_ENV,
    emailSender:process.env.EMAIL_SENDER,
    emailSenderAddress:process.env.EMAIL_SENDER_ADDRESS,
    emailServiceProvider:process.env.EMAIL_SERVICE_PROVIDER,
    mailJetApiKey:process.env.MAIL_JET_API_KEY,
    mailJetApiSecret:process.env.MAIL_JET_API_SECRET,
    nodeMailerUsername:process.env.NODE_MAILER_USERNAME,
    nodeMailerPassword:process.env.NODE_MAILER_PASSWORD,
    nodeMailerPort:process.env.NODE_MAILER_HOST,
    nodeMailerHost:process.env.NODE_MAILER_PORT,

};
