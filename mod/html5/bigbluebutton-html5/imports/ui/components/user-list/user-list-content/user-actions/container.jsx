import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import { defineMessages, injectIntl } from 'react-intl';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';
import UserListService from '/imports/ui/components/user-list/service';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import logger from '/imports/startup/client/logger';
import UserActions from './component';
import { layoutDispatch } from '../../../layout/context';

const UserActionsContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();
  return <UserActions {...{ layoutContextDispatch, ...props }} />;
};

const { dynamicGuestPolicy } = Meteor.settings.public.app;

const meetingMuteDisabledLog = () => logger.info({
  logCode: 'useroptions_unmute_all',
  extraInfo: { logType: 'moderator_action' },
}, 'moderator disabled meeting mute');

export default injectIntl(withTracker((props) => {
  const {
    users,
    clearAllEmojiStatus,
    intl,
    isMeetingMuteOnStart,
  } = props;

  const toggleStatus = () => {
    clearAllEmojiStatus(users);

    notify(
      intl.formatMessage(intlMessages.clearStatusMessage), 'info', 'clear_status',
    );
  };

  return {
    toggleMuteAllUsers: () => {
      UserListService.muteAllUsers(Auth.userID);
      if (isMeetingMuteOnStart) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted');
    },
    toggleMuteAllUsersExceptPresenter: () => {
      UserListService.muteAllExceptPresenter(Auth.userID);
      if (isMeetingMuteOnStart) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all_except_presenter',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted except presenter');
    },
    toggleStatus,
    isMeetingMuted: isMeetingMuteOnStart,
    amIModerator: ActionsBarService.amIModerator(),
    guestPolicy: WaitingUsersService.getGuestPolicy(),
    isMeteorConnected: Meteor.status().connected,
    dynamicGuestPolicy,
  };
})(UserActionsContainer));
