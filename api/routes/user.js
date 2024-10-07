const AuthService = require('@blocklet/sdk/service/auth');
const middlewares = require('@blocklet/sdk/lib/middlewares');
const authClient = new AuthService();
const { PrismaClient } = require('@prisma/client');
const { logError } = require('../libs/log');

const db = new PrismaClient();

module.exports = {
  init(app) {
    app.get('/api/user', middlewares.user(), async (req, res) => {
      if (!req.user) {
        res.json({ user: null });
        return;
      }
      try {
        // get user info from auth service
        const { user } = await authClient.getUser(req.user.did);
        user.role = user.role || req.user.role;
        const profile = await db.user.findUnique({
          where: {
            did: user.did,
          },
        });
        res.json({
          success: true,
          data: {
            ...user,
            ...(profile || {}),
          },
        });
      } catch (err) {
        logError(err, req);
        res.json({
          success: false,
          message: 'please login again'
        });
      }
    });

    app.put('/api/user', async (req, res) => {
      const params = req.body;
      if (!params || !params.name) {
        return res.json({
          success: false,
          message: 'user name is required',
        });
      }
      try {
        const result = await db.user.upsert({
          where: {
            did: params.did,
          },
          update: params,
          create: params,
        });
        res.json({
          success: true,
          data: result,
        });
      } catch (err) {
        logError(err, params);
        res.json({
          success: false,
          message: 'update profile fail'
        });
      }
    });
  },
};
