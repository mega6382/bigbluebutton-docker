import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import LockViewersContainer from '/imports/ui/components/lock-viewers/container';
import Icon from '/imports/ui/components/common/icon/component';
import GuestPolicyContainer from '/imports/ui/components/waiting-users/guest-policy/container';
import LayoutModalContainer from '/imports/ui/components/layout/modal/container';
import Styled from './styles';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  mountModal: PropTypes.func.isRequired,
  isMeetingMuted: PropTypes.bool.isRequired,
  toggleMuteAllUsers: PropTypes.func.isRequired,
  toggleMuteAllUsersExceptPresenter: PropTypes.func.isRequired,
  dynamicGuestPolicy: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  presentationLabel: {
    id: 'app.actionsBar.actionsDropdown.presentationLabel',
    description: 'Upload a presentation option label',
  },
  pollBtnLabel: {
    id: 'app.actionsBar.actionsDropdown.pollBtnLabel',
    description: 'poll menu toggle button label',
  },
  layoutModal: {
    id: 'app.actionsBar.actionsDropdown.layoutModal',
    description: 'Label for layouts selection button',
  },
  muteAllLabel: {
    id: 'app.userList.userOptions.muteAllLabel',
    description: 'Mute all label',
  },
  muteAllDesc: {
    id: 'app.userList.userOptions.muteAllDesc',
    description: 'Mute all description',
  },
  unmuteAllLabel: {
    id: 'app.userList.userOptions.unmuteAllLabel',
    description: 'Unmute all label',
  },
  unmuteAllDesc: {
    id: 'app.userList.userOptions.unmuteAllDesc',
    description: 'Unmute all desc',
  },
  lockViewersLabel: {
    id: 'app.userList.userOptions.lockViewersLabel',
    description: 'Lock viewers label',
  },
  lockViewersDesc: {
    id: 'app.userList.userOptions.lockViewersDesc',
    description: 'Lock viewers description',
  },
  guestPolicyLabel: {
    id: 'app.userList.userOptions.guestPolicyLabel',
    description: 'Guest policy label',
  },
  guestPolicyDesc: {
    id: 'app.userList.userOptions.guestPolicyDesc',
    description: 'Guest policy description',
  },
  muteAllExceptPresenterLabel: {
    id: 'app.userList.userOptions.muteAllExceptPresenterLabel',
    description: 'Mute all except presenter label',
  },
  muteAllExceptPresenterDesc: {
    id: 'app.userList.userOptions.muteAllExceptPresenterDesc',
    description: 'Mute all except presenter description',
  },
});

class UserActions extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
  }

  renderActions() {
    const {
      intl,
      layoutContextDispatch,
      mountModal,
      isMeteorConnected,
      isMeetingMuted,
      toggleMuteAllUsers,
      toggleMuteAllUsersExceptPresenter,
      dynamicGuestPolicy,
    } = this.props;
    const userActions = [
      <Styled.ListItem
        aria-label={intl.formatMessage(intlMessages.presentationLabel)}
        aria-describedby="managePresentations"
        role="button"
        tabIndex={0}
        onClick={() => Session.set('showUploadPresentationView', true)}
      >
        <Icon iconName="upload" />
        <div aria-hidden>
          <Styled.ActionsTitle data-test="managePresentations">
            { intl.formatMessage(intlMessages.presentationLabel) }
          </Styled.ActionsTitle>
        </div>
      </Styled.ListItem>,
      // Polling
      // <Styled.ListItem
      //   aria-label={intl.formatMessage(intlMessages.pollBtnLabel)}
      //   aria-describedby="polling"
      //   role="button"
      //   tabIndex={1}
      //   onClick={() => {
      //     if (Session.equals('pollInitiated', true)) {
      //       Session.set('resetPollPanel', true);
      //     }
      //     layoutContextDispatch({
      //       type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      //       value: true,
      //     });
      //     layoutContextDispatch({
      //       type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      //       value: PANELS.POLL,
      //     });
      //     Session.set('forcePollOpen', true);
      //   }}
      // >
      //   <Icon iconName="polling" />
      //   <div aria-hidden>
      //     <Styled.ActionsTitle data-test="polling">
      //       { intl.formatMessage(intlMessages.pollBtnLabel) }
      //     </Styled.ActionsTitle>
      //   </div>
      // </Styled.ListItem>,
      // Layout
      <Styled.ListItem
        aria-label={intl.formatMessage(intlMessages.layoutModal)}
        aria-describedby="layoutModal"
        role="button"
        tabIndex={2}
        onClick={() => mountModal(<LayoutModalContainer {...this.props} />)}
      >
        <Icon iconName="send" />
        <div aria-hidden>
          <Styled.ActionsTitle data-test="layoutModal">
            { intl.formatMessage(intlMessages.layoutModal) }
          </Styled.ActionsTitle>
        </div>
      </Styled.ListItem>,
    ];

    if (isMeteorConnected) {
      userActions.push(<Styled.ListItem
        aria-label={intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllLabel' : 'muteAllLabel'])}
        aria-describedby="muteAll"
        role="button"
        tabIndex={3}
        onClick={toggleMuteAllUsers}
      >
        <Icon iconName={isMeetingMuted ? 'unmute' : 'mute'} />
        <div aria-hidden>
          <Styled.ActionsTitle data-test="muteAll">
            { intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllLabel' : 'muteAllLabel']) }
          </Styled.ActionsTitle>
        </div>
      </Styled.ListItem>);

      if(!isMeetingMuted) {
        userActions.push(<Styled.ListItem
          aria-label={intl.formatMessage(intlMessages.muteAllExceptPresenterLabel)}
          aria-describedby="muteAllExceptPresenter"
          role="button"
          tabIndex={4}
          onClick={toggleMuteAllUsersExceptPresenter}
        >
          <Icon iconName="mute" />
          <div aria-hidden>
            <Styled.ActionsTitle data-test="muteAllExceptPresenter">
              { intl.formatMessage(intlMessages.muteAllExceptPresenterLabel) }
            </Styled.ActionsTitle>
          </div>
        </Styled.ListItem>);
      }

      if (dynamicGuestPolicy) {
        userActions.push(<Styled.ListItem
          aria-label={intl.formatMessage(intlMessages.guestPolicyLabel)}
          aria-describedby="guestPolicyLabel"
          role="button"
          tabIndex={5}
          onClick={() => mountModal(<GuestPolicyContainer />)}
        >
          <Icon iconName="user" />
          <div aria-hidden>
            <Styled.ActionsTitle data-test="guestPolicyLabel">
              { intl.formatMessage(intlMessages.guestPolicyLabel) }
            </Styled.ActionsTitle>
          </div>
        </Styled.ListItem>);
      }

        userActions.push(<Styled.ListItem
          aria-label={intl.formatMessage(intlMessages.lockViewersLabel)}
          aria-describedby="lockViewersButton"
          role="button"
          tabIndex={6}
          onClick={() => mountModal(<LockViewersContainer />)}
        >
          <Icon iconName="lock" />
          <div aria-hidden>
            <Styled.ActionsTitle data-test="lockViewersButton">
              { intl.formatMessage(intlMessages.lockViewersLabel) }
            </Styled.ActionsTitle>
          </div>
        </Styled.ListItem>);
    }

    return userActions;
  }

  render() {


    return (
      <Styled.UserActions>
        <Styled.Container>
          <Styled.SmallTitle data-test="userActions">
            Actions
          </Styled.SmallTitle>
        </Styled.Container>
        <Styled.ScrollableList>
          <Styled.List>
            {this.renderActions()}
          </Styled.List>
        </Styled.ScrollableList>
      </Styled.UserActions>
    );
  }
}

UserActions.propTypes = propTypes;

export default withModalMounter(injectIntl(UserActions));
