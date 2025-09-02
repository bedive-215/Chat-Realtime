import sequelize from "../configs/databaseConf.js";

import UserModel from "./users.model.js";
import ChatModel from "./chats.model.js";
import ChatParticipantModel from "./chatParticipants.model.js";
import friendModel from "./friend.model.js";

// Khởi tạo models
const User = UserModel(sequelize);
const Chat = ChatModel(sequelize);
const ChatParticipant = ChatParticipantModel(sequelize);
const Friend = friendModel(sequelize);

// Associations
User.belongsToMany(Chat, {
  through: ChatParticipant,
  foreignKey: "user_id",
  otherKey: "chat_id",
});

Chat.belongsToMany(User, {
  through: ChatParticipant,
  foreignKey: "chat_id",
  otherKey: "user_id",
});

User.hasMany(Friend, {
  foreignKey: "requester_id",
  as: "sentRequests"
});

User.hasMany(Friend, {
  foreignKey: "receiver_id",
  as: "receivedRequests"
});

Friend.belongsTo(User, {
  foreignKey: "requester_id",
  as: "requester"
});

Friend.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver"
});


ChatParticipant.belongsTo(User, { foreignKey: "user_id" });
ChatParticipant.belongsTo(Chat, { foreignKey: "chat_id" });

// Gom models lại thành 1 object
const models = {
  sequelize,
  User,
  Chat,
  ChatParticipant,
  Friend
};

export default models;
