const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Domain = require('./domain')(sequelize, Sequelize);

db.User.hasMany(db.Post);
db.Post.belongsTo(db.User, { through: 'Post', as: 'User', foreignKey: 'userId' });

db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag', as: 'Hashtag', foreignKey: 'postId' });
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag', as: 'Post', foreignKey: 'hashtagId' });

db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'followingId' });
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'followerId' });

db.User.belongsToMany(db.Post, { through: 'Like', as: 'Post', foreignKey: 'userId' });
db.Post.belongsToMany(db.User, { through: 'Like', as: "Liker", foreignKey: 'postId' });

db.User.hasMany(db.Domain);
db.Domain.belongsTo(db.User, { through: 'User', as: 'User', foreignKey: 'userId' });

module.exports = db;