import { GroupChatMsg } from '/imports/api/group-chat-msg';
import Logger from '/imports/startup/server/logger';
import addSystemMsg from '/imports/api/group-chat-msg/server/modifiers/addSystemMsg';
import clearChatHasMessages from '/imports/api/users-persistent-data/server/modifiers/clearChatHasMessages';
import UsersPersistentData from '/imports/api/users-persistent-data';

export default function clearGroupChatMsg(meetingId, chatId) {
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const CHAT_CLEAR_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_clear;
  const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

  if (chatId) {
    try {
      const numberAffected = GroupChatMsg.remove({ meetingId, chatId });

      if (numberAffected) {
        Logger.info(`Cleared GroupChatMsg (${meetingId}, ${chatId})`);
        const clearMsg = {
          id: `${SYSTEM_CHAT_TYPE}-${CHAT_CLEAR_MESSAGE}`,
          timestamp: Date.now(),
          correlationId: `${PUBLIC_CHAT_SYSTEM_ID}-${Date.now()}`,
          sender: {
            id: PUBLIC_CHAT_SYSTEM_ID,
            name: '',
          },
          message: CHAT_CLEAR_MESSAGE,
        };
        addSystemMsg(meetingId, PUBLIC_GROUP_CHAT_ID, clearMsg);
        clearChatHasMessages(meetingId, chatId);

        //clear offline users' data
        const selector = {
          meetingId,
          'shouldPersist.hasConnectionStatus': { $ne: true },
          'shouldPersist.hasMessages.private': { $ne: true },
          loggedOut: true
        };
    
        UsersPersistentData.remove(selector);
      }
    } catch (err) {
      Logger.error(`Error on clearing GroupChat (${meetingId}, ${chatId}). ${err}`);
    }
    return true;
  }

  if (meetingId) {
    try {
      const numberAffected = GroupChatMsg.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared GroupChatMsg (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing GroupChatMsg (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = GroupChatMsg.remove({ chatId: { $eq: PUBLIC_GROUP_CHAT_ID } });

      if (numberAffected) {
        clearChatHasMessages(meetingId, chatId=PUBLIC_GROUP_CHAT_ID);

        Logger.info('Cleared GroupChatMsg (all)');
      }
    } catch (err) {
      Logger.error(`Error on clearing GroupChatMsg (all). ${err}`);
    }
  }
}
