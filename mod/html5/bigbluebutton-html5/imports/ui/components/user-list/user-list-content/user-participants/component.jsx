import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';
import { findDOMNode } from 'react-dom';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import UserListItemContainer from './user-list-item/container';
import UserOptionsContainer from './user-options/container';
import Settings from '/imports/ui/services/settings';
import { injectIntl } from 'react-intl';

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}),
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  clearAllEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  currentUser: null,
};

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
});

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const SKELETON_COUNT = 0;

class UserParticipants extends Component {
  constructor() {
    super();

    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      keyMapper: () => 1,
    });

    this.state = {
      selectedUser: null,
      isOpen: false,
      scrollArea: null,
    };

    this.userRefs = [];

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.rove = this.rove.bind(this);
    this.changeState = this.changeState.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.handleClickSelectedUser = this.handleClickSelectedUser.bind(this);
    this.selectEl = this.selectEl.bind(this);
  }

  componentDidMount() {
    document.getElementById('user-list-virtualized-scroll')?.getElementsByTagName('div')[0]?.firstElementChild?.setAttribute('aria-label', 'Users list');

    const { compact } = this.props;
    if (!compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        this.rove,
      );

      this.refScrollContainer.addEventListener(
        'click',
        this.handleClickSelectedUser,
      );
    }

    window.addEventListener('beforeunload', () => Session.set('dropdownOpenUserId', null));
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.isReady;
  }

  selectEl(el) {
    if (!el) return null;
    if (el.getAttribute('tabindex')) return el?.focus();
    this.selectEl(el?.firstChild);
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedUser } = this.state;

    if (selectedUser) {
      const { firstChild } = selectedUser;
      if (!firstChild.isEqualNode(document.activeElement)) {
        this.selectEl(selectedUser);
      }
    }
  }

  componentWillUnmount() {
    this.refScrollContainer.removeEventListener('keydown', this.rove);
    this.refScrollContainer.removeEventListener('click', this.handleClickSelectedUser);
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  getNonPresenters(users) {
    const nonPresenters = [];
    for (const user of users) {
      if(!user.presenter && user?.role != ROLE_MODERATOR) {
        nonPresenters.push(user);
      }
    }
    return nonPresenters;
  }

  rowRenderer (nonPresenters) {
    return ({
      index,
      parent,
      style,
      key,
    }) => {
      const {
        compact,
        setEmojiStatus,
        users,
        requestUserInformation,
        currentUser,
        meetingIsBreakout,
        lockSettingsProps,
        isThisMeetingLocked,
      } = this.props;
      const { scrollArea } = this.state;
      const user = nonPresenters[index];
      const isRTL = Settings.application.isRTL;
      const isForPresenterList = false;

      return (
        <CellMeasurer
          key={key}
          cache={this.cache}
          columnIndex={0}
          parent={parent}
          rowIndex={index}
        >
          <span
            style={style}
            key={key}
            id={`user-${user?.userId || ''}`}
          >
            <UserListItemContainer
              {...{
                compact,
                setEmojiStatus,
                requestUserInformation,
                currentUser,
                meetingIsBreakout,
                scrollArea,
                isRTL,
                lockSettingsProps,
                isThisMeetingLocked,
                isForPresenterList,
              }}
              user={user}
              getScrollContainerRef={this.getScrollContainerRef}
            />
          </span>
        </CellMeasurer>
      );
    };
  }

  handleClickSelectedUser(event) {
    let selectedUser = null;
    if (event.path) {
      selectedUser = event.path.find(p => p.id && p.id.includes('user-'));
    }
    this.setState({ selectedUser });
  }

  rove(event) {
    const { roving } = this.props;
    const { selectedUser, scrollArea } = this.state;
    const usersItemsRef = findDOMNode(scrollArea.firstChild);
    event.stopPropagation();
    roving(event, this.changeState, usersItemsRef, selectedUser);
  }

  changeState(ref) {
    this.setState({ selectedUser: ref });
  }

  render() {
    const {
      intl,
      users,
      compact,
      clearAllEmojiStatus,
      currentUser,
      meetingIsBreakout,
      isMeetingMuteOnStart,
    } = this.props;
    const { isOpen, scrollArea } = this.state;
    const nonPresenters = this.getNonPresenters(users);
    return (
      <Styled.UserListColumn data-test="userList">
        {
          !compact
            ? (
              <Styled.Container>
                <Styled.SmallTitle>
                  {intl.formatMessage(intlMessages.usersTitle)}
                  {nonPresenters.length > 0 ? ` (${nonPresenters.length})` : null}
                </Styled.SmallTitle>
                {/* {currentUser?.role === ROLE_MODERATOR
                  ? (
                    <UserOptionsContainer {...{
                      users,
                      clearAllEmojiStatus,
                      meetingIsBreakout,
                      isMeetingMuteOnStart,
                    }}
                    />
                  ) : null
                } */}

              </Styled.Container>
            )
            : <Styled.Separator />
        }
        <Styled.VirtualizedScrollableList
          id={'user-list-virtualized-scroll'}
          aria-label="Users list"
          role="region"
          tabIndex={0}
          ref={(ref) => {
            this.refScrollContainer = ref;
          }}
        >
          <span id="participants-destination" />
          <AutoSizer>
            {({ height, width }) => (
              <Styled.VirtualizedList
                {...{
                  isOpen,
                  users,
                }}
                ref={(ref) => {
                  if (ref !== null) {
                    this.listRef = ref;
                  }

                  if (ref !== null && !scrollArea) {
                    this.setState({ scrollArea: findDOMNode(ref) });
                  }
                }}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this.rowRenderer(nonPresenters)}
                rowCount={nonPresenters.length || SKELETON_COUNT}
                height={height - 1}
                width={width - 1}
                overscanRowCount={30}
                deferredMeasurementCache={this.cache}
                tabIndex={-1}
              />
            )}
          </AutoSizer>
        </Styled.VirtualizedScrollableList>
      </Styled.UserListColumn>
    );
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default injectIntl(UserParticipants);
