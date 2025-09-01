import sequelize from "../configs/databaseConf.js";

import UserModel from "./users.model.js";
import ChatModel from "./chats.model.js";
import ChatParticipantModel from "./chatParticipants.model.js";

// Khởi tạo models
const User = UserModel(sequelize);
const Chat = ChatModel(sequelize);
const ChatParticipant = ChatParticipantModel(sequelize);

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

ChatParticipant.belongsTo(User, { foreignKey: "user_id" });
ChatParticipant.belongsTo(Chat, { foreignKey: "chat_id" });

// Gom models lại thành 1 object
const models = {
  sequelize,
  User,
  Chat,
  ChatParticipant,
};

export default models;
